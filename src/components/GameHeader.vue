<script setup lang="ts">
import { ref } from 'vue'
import CreateGameModel from './CreateGameModel.vue';
import { user } from '@/store/user'

const createVisible = ref(false)

function createGame() {
  createVisible.value = true
}
function onClose () {
  createVisible.value = false
}
</script>

<template>
  <el-header class="header">
    <div>用户: {{ user.nickname }}</div>
    <el-button @click="createGame">创建游戏</el-button>
  </el-header>
  <CreateGameModel :visible="createVisible" :onClose="onClose"></CreateGameModel>
</template>

<style scoped>
.header {
  border-bottom: 1px solid #000;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

</style>
