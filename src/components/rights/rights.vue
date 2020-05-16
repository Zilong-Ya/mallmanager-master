<template>
<el-card shadow="always" >
  <!-- 面包屑 -->
  <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ name: 'default' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>权限列表</el-breadcrumb-item>
  </el-breadcrumb> -->
   <!-- 面包屑导航 -->
  <com-breadcrumb levelName1="权限管理" levelName2="权限列表"></com-breadcrumb>

  <!-- 权限列表 -->
  <el-table :data="rightList" style=" margin-top:30px" :border="true" height="500px">
    <el-table-column type="index" label="#" width="50">
    </el-table-column>
    <el-table-column prop="authName" label="权限名称">
    </el-table-column>
    <el-table-column prop="path" label="路径">
    </el-table-column>
    <el-table-column label="层级">
      <template slot-scope="scope">
        <span v-if="scope.row.level==='0'">一级</span>
        <span v-if="scope.row.level==='1'">二级</span>
        <span v-if="scope.row.level==='2'">三级</span>
      </template>
    </el-table-column>
  </el-table>
</el-card>
</template>

<script>
export default {
  data() {
    return {
      rightList: [] // 权限数据集合
    }
  },
  created() {
    // 请求路径：rights/:type
    // 请求方法：get
    this.$http.get(`rights/list`)
      .then(res => {
        const {
          data,
          meta: {
            msg,
            status
          }
        } = res.data
        if(status === 200){
          this.$message.success(msg)
          this.rightList = data
        }else{
          this.$message.error(msg)
        }
      }).catch(res => {})
  },
}
</script>

<style scoped>

</style>
