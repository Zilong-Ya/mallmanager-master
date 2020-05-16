<template>
<el-container class="container">
  <el-header class="header">
    <el-row>
      <el-col :span="22">
        <h2 class="title">电商后台管理系统</h2>
      </el-col>
      <el-col :span="2">
        <a href="#" class="logout" @click.prevent="handleExit()">退出</a>
      </el-col>
    </el-row>
  </el-header>
  <el-container>
    <el-aside width="200px" class="aside">
      <el-menu :unique-opened="true" :router="true">
        <el-submenu :index="index+''" v-for="(item, index) in menus" :key="index">
          <template slot="title">
            <i class="el-icon-s-tools"></i>
            <span>{{item.authName}}</span>
          </template>
          <el-menu-item :index="'/'+item1.path" v-for="(item1, index) in item.children" :key="index">
            <i class="el-icon-menu"></i>
            {{item1.authName}}
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <el-main class="main">
      <!-- 渲染子视图 -->
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  data() {
    return {
      menus: [] // 菜单项
    }
  },
  // 对象初始化前 ,验证用户是否登录
  // beforeCreate() {
  //   let token = localStorage.getItem('token')
  //   if (!token) {
  //     // 验证token
  //     this.$message.warning('请先登录')
  //     // 跳回 login
  //     this.$router.push({
  //       name: 'login'
  //     })
  //   }
  // },
  created() { // 动态加载左侧菜单项
    // 请求路径：menus
    // 请求方法：get
    this.$http.get(`menus`)
      .then(res => {
        this.menus = res.data.data
      }).catch()
  },
  methods: {
    // 退出
    handleExit() {
      localStorage.removeItem('token')
      this.$router.push({
        name: 'login'
      })
      this.$message.success('退出成功')
    }
  },
}
</script>

<style scoped>
.container {
  height: 100%;
}

.header {
  background-color: #B3C0D1;
}

.main {
  background-color: #e9eef3;
}

.title {
  text-align: center;
  line-height: 60px;
  color: #797A7C;
}

.logout {
  line-height: 60px;
  text-decoration: none;
}
</style>
