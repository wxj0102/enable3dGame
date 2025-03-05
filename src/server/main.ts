// 服务的初始文件

import Game from "./class/game"
import User from "./class/user"


// 当前用户列表
let userList: User[] = []

// 当前game列表
let gameList: Game[] = []

function main () {
  checkUserList (userList)
}

function checkUserList (userList: User[]) {
  userList = userList.filter(v => {
    const isActive = v.isActive()
    if(!isActive) {
    // 检测是否是正在连接的user 如果不是
    // 1 如果是房主 则把房主交给其他用户
    // 2 如果没有其他用户 则销毁Game
    // 3 销毁用户
    }

    return isActive
  })
  
}