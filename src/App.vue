<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import LoginModel from '@/components/LoginModel.vue';

</script>

<template>
  <div class="container">
    <div class="navigate">
      <div class="router-item">
        <RouterLink to="/">首页</RouterLink>
      </div>
      <div class="router-item">
        <RouterLink to="/game">游戏</RouterLink>
      </div>
    </div>
    <div class="view">
      <RouterView></RouterView>
      <LoginModel></LoginModel>
    </div>

  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.navigate {
  display: flex;
}
.router-item {
  background-color: blue;
  margin: 5px;
  padding: 3px;
  border-radius: 4px;
}
.router-item>a {
  color: #fff;
  text-decoration: none ;
}
.view {
  flex: 1;
}
</style>
