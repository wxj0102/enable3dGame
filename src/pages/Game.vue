<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { physicsReady } from '@/utils/utils'
import { createProject } from '@/class/mainGame'

const instance = getCurrentInstance()
const containerRef = ref()
onMounted(() => {
  physicsReady.then(() => {
    const key = sessionStorage.getItem('key') || ''
    const gameId = instance?.proxy?.$route.query.id
    createProject({
      containerId: containerRef.value.id,
      send: instance?.proxy?.$send,
      onMessage: instance?.proxy?.$onSocketMessage,
      key,
      id: gameId,
      onGameOver: (game: any) => {
        game.pl.exit()
        setTimeout(() => {
          ElMessageBox.confirm(
            '你已经被击败, 是否要复活?',
            'Warning',
            {
              confirmButtonText: '是',
              cancelButtonText: '否',
              type: 'warning',
            }
          )
            .then(() => {
              game.reGame()
            })
            .catch(() => {
              instance?.proxy?.$router.push(`/`)
            })
        })
      }
    })
  })
})

function sendHeart() {
  const key = sessionStorage.getItem('key')
  instance?.proxy?.$send({
    operation: 'heart',
    key,
  })
}
sendHeart()

const interval = setInterval(sendHeart, 1000)

onUnmounted(() => {
  instance?.proxy?.$offSocketMessage('game')
  clearInterval(interval)
})

</script>

<template>
  <div class="container" ref="containerRef" id="game">

  </div>
</template>

<style scoped>
.container {
  background-color: red;
}
</style>
