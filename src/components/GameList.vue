<script setup lang="ts">
import { ref, onMounted, onUnmounted, getCurrentInstance, } from 'vue'

const instance = getCurrentInstance()
const tableData = ref([])
let interval: any

onMounted(() => {
  interval = setInterval(getData, 10000)
  getData()
  instance?.proxy?.$onSocketMessage('gameList', (data) => {
    if (data.operation === 'gameList') {
      tableData.value = data.data
    }
  })
})

onUnmounted(() => {
  clearInterval(interval)

  instance?.proxy?.$offSocketMessage('gameList')
})

function joinGame(record: any) {
  instance?.proxy?.$router.push(`/game?id=${record.id}`)
}

function getData() {
  instance?.proxy?.$send({
    operation: 'gameList',
  })
}

function countFormatter (record: any) {
  return `${record.count} / ${record.maxCount}`
}

</script>

<template>
  <el-main class="main">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="roomname" label="房间名" width="180" />
      <el-table-column prop="onwer" label="房主" width="180" />
      <el-table-column :formatter="countFormatter" label="当前人数" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="joinGame(scope.row)">
            加入游戏
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-main>
</template>

<style scoped>
.main {
  flex: 1;
}
</style>
