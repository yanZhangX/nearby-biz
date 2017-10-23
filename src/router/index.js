import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Index from '@/views'
import NoResource from 'VIEW/no-resource'

import dashboard from './dashboard'
import stock from './stock'
import remaining from './remaining'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
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
      children: [...dashboard.routes, ...stock.routes, ...remaining.routes]
    },
    { path: '*', redirect: '/' }
  ]
})
