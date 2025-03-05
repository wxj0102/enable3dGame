export default class User {
  isLogin: boolean = false

  login (username, password) {
    // 登录成功后 isLogin 变成true
  }

  createGame (name: string) {
    // 创建一个room
  }

  deleteGame () {
    // 解散房间 如果不是房主 则不能解散
  }

  isActive () {
    return true
  }
}