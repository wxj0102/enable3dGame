<script setup lang="ts">
import { ref, getCurrentInstance, onMounted, toRef, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { user } from '@/store/user';

const props = defineProps<{ onClose: () => void, visible: boolean }>()

const loading = ref(false)
const instance = getCurrentInstance()
const propsRef = toRef(props)
const form = ref({
  roomName: '',
})

onMounted(() => {
  instance?.proxy?.$onSocketMessage('createGame', (data) => {
    if (data.operation === 'createGame') {
      loading.value = false
      if (data.code === 0) {
        instance?.proxy?.$send({
          operation: 'gameList',
        })
        // 提示创建成功
        onClose()
        // 跳转到游戏page
        instance?.proxy?.$router.push(`/game?id=${data.gameId}`)
      } else {
        // 报个错就行
        ElMessage.error('创建失败')
      }
    }
  })
})

onUnmounted(() => {
  instance?.proxy?.$offSocketMessage('createGame')
})

function onSubmit() {
  createGame()
}

function onClose() {
  props.onClose()
  form.value.roomName = ''
}

function createGame() {
  const key = user.key
  const roomname = form.value.roomName
  instance?.proxy?.$send({
    operation: 'createGame',
    key,
    roomname,
  })
  loading.value = true
}

</script>

<template>
  <el-dialog v-model="propsRef.visible" title="请登录" width="500" :show-close="false" :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form :module="form" label-position="top" v-loading="loading">
      <el-form-item label="房间名">
        <el-input v-model="form.roomName" />
      </el-form-item>
      <div :style="{ textAlign: 'right' }">
        <el-button type="primary" @click="onSubmit">创建游戏</el-button>
        <el-button type="primary" @click="onClose">取消</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped></style>
