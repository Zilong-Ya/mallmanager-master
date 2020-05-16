<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  #app{
    height: 100%;
  }
  .el-card__body{
    padding-bottom: 50px;
  }
</style>
