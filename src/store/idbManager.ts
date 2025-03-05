import { reactive } from 'vue'
import IndexDBManager from '@/IdbManager'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 数据库名称 随便
export const dbName = 'model'

// store名称 类似表名 随便
export const storeName = 'model'

// 版本号 只能为整数 每次图片发生改变的时候 都需要修改 该改动会导致用户重新缓存图片
const version = 6

// 我写的简易操作库 目前需要的方法都在下面写好了
const manager = new IndexDBManager(dbName, version)

// 以下操作都只有成功的情况 目前没遇到过失败的 遇到了再说吧
manager.init(() => {
  // 闲得慌可以在这里加一个动画
  dbManager.current.createStore(storeName, 'path')
})

export const dbManager = reactive<{
  current: IndexDBManager,
}>({
  current: manager,
})

export async function getModel(path: string): Promise<GLTF> {
  const dataList = await dbManager.current.getAll(storeName)
  const currentData = dataList.find(v => v.path === path)
  if (currentData) {
    const model = await loadGLBFromArrayBuffer(currentData.buffer)
    return model
  }
  throw new Error('模型不存在')
}

// 将 ArrayBuffer 转换为 GLB 模型
async function loadGLBFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    const dracoLoader = new DRACOLoader()
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader)
    // 使用 parse 方法解析 ArrayBuffer
    loader.parse(
      arrayBuffer,
      '', // 相对路径（如果有外部资源需要处理）
      (gltf) => {
        resolve(gltf);
      },
      (error: any) => {
        reject(error);
      }
    );
  });
}
