import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Index from '@/views'
import WxLogin from '@/views/wxLogin'
import NoResource from 'VIEW/no-resource'

import dashboard from './dashboard'
import stock from './stock'
import remaining from './remaining'
import product from './product'
import bookingSureList from './bookingSureList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/wxLogin',
      name: 'wxLogin',
      component: WxLogin
    },
    {
      path: '/no-resource/:code',
      name: 'noResource',
      component: NoResource
    },
    {
      path: '/',
      name: 'index',
      redirect: 'dashboard',
      component: Index,
      children: [
        ...dashboard.routes,
        ...stock.routes,
        ...remaining.routes,
        ...product.routes,
        ...bookingSureList.routes
      ]
    },
    { path: '*', redirect: '/' }
  ]
})
