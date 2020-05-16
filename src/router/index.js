import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login/login.vue'
import Default from '@/components/home/default.vue'
import Home from '@/components/home/home.vue'
import User from '@/components/user/user.vue'
import Rights from '@/components/rights/rights.vue'
import Roles from '@/components/rights/Roles.vue'
import Goods from '@/components/goods/goodslist.vue'
import GoodsAdd from '@/components/goods/goodsadd.vue'
import GoodsEdit from '@/components/goods/goodsedit.vue'
import Cateparams from '@/components/goods/cateparams.vue'
import GoodsCate from '@/components/goods/goodscate.vue'
import Orders from '@/components/order/orders.vue'
import Reports from '@/components/reports/reports.vue'
import {Message} from 'element-ui'

Vue.use(Router)

const router = new Router({
  routes: [{
    path: '/',
    name: 'login',
    component: Login
  }, {
    path: '/home',
    name: 'home',
    component: Home,
    children: [{
        path: '/',
        name: 'default',
        component: Default
      },
      {
        path: '/users',
        name: 'users',
        component: User
      },
      {
        path: '/rights',
        name: 'rights',
        component: Rights
      },
      {
        path: '/roles',
        name: 'roles',
        component: Roles
      },
      {
        path: '/goods',
        name: 'goods',
        component: Goods
      },
      {
        path: '/goodsadd',
        name: 'goodsadd',
        component: GoodsAdd
      },
      {
        path: '/goodsedit/:id',
        name: 'goodsedit',
        component: GoodsEdit
      },
      {
        path: '/params',
        name: 'params',
        component: Cateparams
      },
      {
        path: '/categories',
        name: 'categories',
        component: GoodsCate
      },
      {
        path: '/orders',
        name: 'orders',
        component: Orders
      },
      {
        path: '/reports',
        name: 'reports',
        component: Reports
      },
    ]
  }]
})
// 解决两次访问相同路由地址报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
// 路由中实现控制，路由守卫 （类似过滤器）
/**
 * to 访问后的路由地址
 * from 访问前的路由地址
 * next ? 继续执行(守卫通过)
 */
router.beforeEach((to, from, next) => {
  // 获取token 
  let token = localStorage.getItem('token')
  if (to.name === 'login' || token) { // 请求登录或者有koken不需要守卫
    next()
  } else {
    router.push({name:'login'}) // 没有登录
    Message.warning('请先登录')
    return 
  }
})

// 导出路由
export default router
