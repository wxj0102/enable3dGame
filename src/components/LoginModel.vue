<script setup lang="ts">
import { ref, watch, getCurrentInstance, onMounted, toRef, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { user } from '@/store/user'

const loading = ref(false)
const instance = getCurrentInstance()
const dialogVisible = ref(false)
const form = ref({
  username: '',
  password: '',
})

onMounted(() => {
  const key = sessionStorage.getItem('key')
  if (key) {
    // 用key登录
    loading.value = true
    loginWithKey(key)
  }


  instance?.proxy?.$onSocketMessage('loginMsg', (data) => {
    if (data.operation === 'login') {
      if (data.code === 0) {
        const key = data.key
        sessionStorage.setItem('key', key)
        user.key = key
        user.nickname = data.nickname

        if (data.from === 'input') {
          ElMessage.success('登录成功')
        }
      } else {
        // 报个错就行
        sessionStorage.removeItem('key')
        if (data.from === 'input') {
          ElMessage.error('登录失败, 请重试')
        }
        loading.value = false
      }
    }
  })
})

onUnmounted(() => {
  instance?.proxy?.$offSocketMessage('loginMsg')
})

watch(() => user.key, () => {
  if (user.key) {
    dialogVisible.value = false
  } else {
    dialogVisible.value = true
  }
}, {
  immediate: true,
})

function onSubmit() {
  loginWithUser(form.value.username, form.value.password)
}

function loginWithKey(key: string) {
  instance?.proxy?.$send({
    operation: 'loginKey',
    key,
  })
}

function loginWithUser(username: string, password: string) {
  instance?.proxy?.$send({
    operation: 'login',
    username: username,
    password: password,
  })
}

</script>

<template>
  <el-dialog v-model="dialogVisible" title="请登录 (账号密码随便输入)" width="500" :show-close="false" :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form :module="form" label-position="top" v-loading="loading">
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" />
      </el-form-item>
      <div :style="{ textAlign: 'right' }">
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped></style>
