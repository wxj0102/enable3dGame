import { createApp } from 'vue';
import './style.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue';
import router from './router';
import PATH_LIST from './model.json'
import { dbManager, storeName } from '@/store/idbManager'

const messageCallbackMap: Record<string, (value: any) => void> = {

}

const wsUrl = import.meta.env.DEV
  ? 'ws://localhost:5174/ws'
  : 'ws://' + window.location.hostname + ':8999/ws'
// 创建一个 WebSocket 连接，这里的 URL 应该指向你的 WebSocket 服务端地址
const socket = new WebSocket(wsUrl);

function sendMsg(msg: Record<string, any>) {
  const msgJson = JSON.stringify(msg)
  socket.send(msgJson)
}

// 当连接成功建立时触发
socket.onopen = function (event) {
  console.log('WebSocket connection opened:', event);
  // 在这之后才可以创建app
  dbManager.current.ready().then(() => {
    document.title = '加载中...'
    // 先执行检测 不论是否第一次都可以这么做
    testLoad()
  })
};

// 当收到服务器消息时触发
socket.onmessage = function (event) {
  const keys = Object.keys(messageCallbackMap)
  keys.forEach(key => {
    const fn = messageCallbackMap[key]
    fn(JSON.parse(event.data))
  })
};

// 当连接关闭时触发
socket.onclose = function (event) {
  // 强制弹窗 强制刷新
};

// 当发生错误时触发
socket.onerror = function (event) {
  // 还没想好 先不管
  document.body.innerHTML = '连接失败 请刷新'
};

function createVue() {
  const app = createApp(App);
  app.config.globalProperties.$send = (msg: Record<string, any>) => {
    sendMsg(msg)
  }
  app.config.globalProperties.$onSocketMessage = (key: string, callback: (value: any) => void) => {
    messageCallbackMap[key] = callback
  }
  app.config.globalProperties.$offSocketMessage = (key: string) => {
    if (messageCallbackMap[key]) {
      delete messageCallbackMap[key]
    }
  }
  app.use(ElementPlus)
  app.use(router);
  app.mount('#app');
}

declare module 'vue' {
  export interface ComponentCustomProperties {
    $send: (msg: Record<string, any>) => void;
    $onSocketMessage: (key: string, callback: (value: any) => void) => void
    $offSocketMessage: (key: string) => void
  }
}

function testLoad() {
  dbManager.current.getAll(storeName).then((list) => {
    console.log(list)
    const errorList: string[] = []
    // 这里需要检测资源是否正确
    PATH_LIST.forEach(currentPath => {
      const currentItem = list.find(item => item.path === currentPath)
      if (!currentItem) {
        // 某个资源没有被找到
        errorList.push(currentPath)
      }
    })
    if (errorList.length > 0) {
      // 校验失败
      loadDataList(errorList)
      // 有异常
    } else {
      // 校验成功
      document.title = '枪战世界'
      createVue()
    }
  })
}

function loadDataList(pathList = PATH_LIST) {
  const promiseList: Promise<any>[] = []
  let count = 0
  // const loadMode = pathList === PATH_LIST ? '完全加载' : '补充加载'
  pathList.forEach((path: string) => {
    promiseList.push(new Promise((resolve, reject) => {
      fetch(path).then((response) => {
        return response.arrayBuffer()
      }).then(buffer => {
        // 这里计算进度
        dbManager.current.add(storeName, { path, buffer })
        count += 1
        document.title = `进度${count} / ${pathList.length}`
        resolve(buffer)
      }).catch(reject)
    }))
  })
  Promise.all(promiseList).finally(() => {
    // 不用管了 反正本地资源多 只管检测
    testLoad()
  })
}
