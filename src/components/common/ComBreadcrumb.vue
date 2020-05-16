<template>
<el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
  <el-breadcrumb-item :to="{ name: 'default' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>{{this.levelName1}}</el-breadcrumb-item>
  <el-breadcrumb-item>{{this.levelName2}}</el-breadcrumb-item>
</el-breadcrumb>
</template>

<script>
export default {
  name: 'ComBreadcrumb',
  props: ['levelName1', 'levelName2']
}
</script>

<style scoped>
  .breadcrumb{
    margin-bottom: 20px;
  }
</style>
