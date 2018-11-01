import Vue from 'vue'
import App from './App'
import router from './router'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
// import 'element-ui/lib/theme-default/index.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'weui/dist/style/weui.min.css'
import 'SCSS/common.scss'
import './filter'
import ElementUi from 'element-ui'
import {appHost, getToken} from './const'
import MyPlugin from './plugin/index'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(ElementUi)
Vue.use(MyPlugin)

Vue.http.options.emulateHTTP = true
Vue.http.options.timeout = 30000
Vue.http.interceptors.push(function (request, next) {
  request.headers.set('Authorization', getToken())
  request.url = appHost() + request.url + (request.url.indexOf('?') > -1 ? ('&timestamp=' + new Date().getTime()) : ('?timestamp=' + new Date().getTime()))
  next(function (response) {
    return response
  })
})

Vue.config.productionTip = false

// 注册一个全局自定义指令 v-focus
Vue.directive('focus', {
  // 当绑定元素插入到 DOM 中。
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})

/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
