<template>
<div class="login-wrap">
  <el-form class="login-form" :rules="rules" status-icon ref="loginForm" label-position="top" label-width="80px" :model="formdata">
    <h2>用户登录</h2>
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formdata.username"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="formdata.password" show-password></el-input>
    </el-form-item>
    <el-button type="primary" class="login-btn" @click.prevent="handleLogin()">登录</el-button>
  </el-form>
</div>
</template>

<script>
export default {
  data() {
    return {
      formdata: {username:'admin',password:'123456'},
      rules: {
        username: [{
          required: true,
          message: '请输入用户名',
          trigger: 'blur'
        }],
        password: [{
            required: true,
            message: '请输入密码',
            trigger: 'change'
          },
          {
            min: 6,
            max: 16,
            message: '长度在 6 到 16 个字符',
            trigger: 'blur'
          }
        ],
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
          // 登录请求
          this.$http.post('login', this.formdata)
            .then(res => {
              // 对象解构
              const {
                data,
                meta: {
                  msg,
                  status
                }
              } = res.data
              if (status === 200) {
                // 登录成功 提示
                this.$message.success(msg)
                // 清空表单
                this.formdata = {}
                // 需要将token存储 浏览器本地存储localStorage
                let token = data.token // => 服务器颁发的凭证
                localStorage.setItem('token', token)
                // 页面跳转到主页
                this.$router.push({
                  name: 'home'
                })
              } else {
                this.$message.error(msg)
              }
            }).catch(res => {})
        } else {
          return false
        }
      });
    }
  },
}
</script>

<style scoped>
.login-wrap {
  background-color: #324152;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  width: 500px;
  background-color: #fff;
  padding: 30px;
  border-radius: 5px;
}

.login-btn {
  width: 100%;
}
</style>
