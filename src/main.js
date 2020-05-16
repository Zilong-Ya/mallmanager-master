// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/base.css'
import App from './App'
import router from './router'
import httpServer from '@/plugins/http.js'
import moment from 'moment'
// 面包屑全局导入
import ComBreadcrumb from '@/components/common/ComBreadcrumb.vue'


// element-tree-grid 
// var ElTreeGrid = require('element-tree-grid')
// Vue.component(ElTreeGrid.name,ElTreeGrid)

// 导入插件库
Vue.use(ElementUI)
// 导入Axios
Vue.use(httpServer)

// 日期格式化过滤器
Vue.filter("fmtDate", (value,fmtStr)=>{
    return moment(value).format(fmtStr)
})

// 定义全局组件
Vue.component('ComBreadcrumb',ComBreadcrumb)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App},
  template: '<App/>'
})
