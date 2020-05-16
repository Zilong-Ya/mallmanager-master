import Vue from 'vue'
import axios from 'axios'

// Vue 自定义插件
const MyPlugin = {}

MyPlugin.install = function (Vue, options) {
  var instance = axios.create({
    baseURL : 'http://localhost:8888/api/private/v1/'
  })
  // 添加请求拦截器 (针对每一次请求)
  instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    // login不需要拦截
    if(config.url !== 'login'){
      // axios.defaults.headers.common["Authorization"] = localStorage.getItem("token") 全局设置
      // config 给当前请求设置
      config.headers["Authorization"] = localStorage.getItem("token")
    }
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

  // 添加实例方法
  // axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
  // 只会初始化一次 : 不建议再该处设置token
  // console.log('token=>'+localStorage.getItem("token"))
  // axios.defaults.headers.common["Authorization"] = localStorage.getItem("token")
  Vue.prototype.$http = instance
}

export default MyPlugin
