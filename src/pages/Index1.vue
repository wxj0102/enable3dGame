<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const gameList = [{
  title: '111',
  owner: '222',
  person: 2,
}, {
  title: '111',
  owner: '222',
  person: 2,
}, {
  title: '111',
  owner: '222',
  person: 8,
}]

const loginRef = ref(false)

const gameListRef = ref(gameList)

const instance = getCurrentInstance()
const key = sessionStorage.getItem('key')
if (key) {
  instance?.proxy?.$send({
    operation: 'loginKey',
    key,
  })
}
instance?.proxy?.$onSocketMessage('loginMsg', (data) => {
  if (data.code === 0) {
    if (data.operation === 'login') {
      const key = data.key
      sessionStorage.setItem('key', key)
    }
    loginRef.value = true
  }
  if (data.code === 1) {
    sessionStorage.removeItem('key')
  }
  console.log(data)
})

function joinHome(game: any) {
  console.log('加入游戏', game)
}

function createGame() {
  console.log('创建游戏')
}

function onFormSubmit(e) {
  const form = e.target
  const username = form.username.value
  const password = form.password.value
  console.log(username, password)

  instance?.proxy?.$send({
    operation: 'login',
    username: username,
    password: password,
  })
  e.preventDefault()
}

</script>

<template>
  <div class="container" ref="containerRef">
    <div class="game-bar">
      <div class="user">
        <div>xxx</div>
      </div>
      <div class="create-game-button">
        <div class="button" @click="createGame()">
          创建游戏
        </div>
      </div>
    </div>
    <div class="game-list">
      <div class="game-list-item" v-for="item in gameListRef">
        <div class="title">
          房间名: {{ item.title }}
        </div>
        <div class="owner">
          房主: {{ item.owner }}
        </div>
        <div class="person">
          在线人数: {{ item.person }} / 8
        </div>
        <div :class="{ button: true, disabled: item.person === 8, }" @click="item.person !== 8 && joinHome(item)">
          加入房间
        </div>
      </div>
    </div>
  </div>
  <div class="model" :style="{ display: loginRef ? 'hidden' : 'flex' }">
    <form @submit="onFormSubmit" class="form">
      <div class="form-item">
        <div>用户名: </div>
        <input name="username">
      </div>
      <div class="form-item">
        <div>密码: </div>
        <input name="password">
      </div>
      <button class="button" type="submit">登录</button>
    </form>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;
}

.game-bar {
  display: flex;
  height: 60px;
  width: 100%;
}

.user {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.create-game-button {
  margin-right: 20px;
}


.game-list {
  width: 90%;
  flex: 1;
  display: flex;
  overflow-y: auto;
  overflow-x: hidden;
  flex-direction: column;
  border: 1px solid #333;
  color: #333;
}

.game-list-item {
  width: 100%;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.game-list-item:first-of-type {
  border-top: none;
}

.title {
  flex: 1;
  margin-left: 4px;
}

.owner {
  width: 30%;
}

.person {
  width: 140px;
}

.button {
  margin-top: 4px;
  margin-bottom: 4px;
  background-color: red;
  border-radius: 6px;
  margin-right: 4px;
  padding: 0px 8px;
  color: #fff;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 100%;
  outline: none;
  border: none;
}

.disabled {
  color: #333;
  background-color: #ccc;
  cursor: not-allowed;
}

.model {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #000;
  opacity: 0.6;
  z-index: 0;
}

.form {
  width: 600px;
  height: 520px;
  border: 1px solid #333;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.form-item {
  margin-bottom: 12px;
}

.form input {
  width: 100%;
  height: 36px;
  margin-top: 10px;
}

.form button {
  height: 36px;
  width: 120px;
  align-self: center;
  cursor: pointer;
}
</style>
