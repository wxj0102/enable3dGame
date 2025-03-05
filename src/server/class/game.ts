import User from './user'

export default class Game {
  constructor (user: User) {
    // 创建一场游戏
    this.gameMaster = user
  }

  // 房主
  gameMaster: User

  start () {
    
  }

  end () {
    
  }

  changeMaster (user: User) {
    this.gameMaster = user
  }
  
}