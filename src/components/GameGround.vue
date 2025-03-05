<script setup lang="ts">
import GameHeader from './GameHeader.vue';
import GameList from './GameList.vue';

</script>

<template>
  <el-container class="container" direction="vertical">
    <GameHeader></GameHeader>
    <GameList></GameList>
  </el-container>
</template>

<style scoped>
.container {
  height: 100%;
}
</style>
