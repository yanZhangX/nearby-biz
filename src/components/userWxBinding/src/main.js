// import Vue from 'vue'
// import UserWxBinding from 'main.vue'
//
// const userWxBinding = Vue.extend(UserWxBinding)
//
// const getDOM = function (dom) {
//   if (dom.nodeType === 3) {
//     dom = dom.nextElementSibling || dom.nextSibling
//     getDOM(dom)
//   }
//   return dom
// }
//
// const zIndex = 20141223
//
// const getZIndex = function () {
//   return zIndex
// }
//
// const MyUserWxBinding = {
//   instances: [],  // 用来存储所有的弹出层实例
//   visible: false,
//   // 弹窗框打开时调用此方法
//   open (instance) {
//     if (!instance || this.instances.indexOf(instance) !== -1) return
//
//     // 当没有遮盖层时，显示遮盖层
//     if (this.instances.length === 0) {
//       this.show()
//     }
//
//     // 存储打开的弹出框组件
//     this.instances.push(instance)
//     const dom = getDOM(instance.$el)
//     dom.style.zIndex = getZIndex()
//   },
//   close (instance) {
//     let index = this.instances.indexOf(instance)
//     if (index === -1) return
//
//     Vue.nextTick(() => {
//       this.instances.splice(index, 1)
//
//       // 当页面上没有弹出层了就关闭遮盖层
//       if (this.instances.length === 0) {
//         this.closeDiv()
//       }
//     })
//   },
//   show () {
//     let fullscreenLogin = this.fullscreenLogin = new FullscreenLogin({
//       el: document.createElement('div')
//     })
//     const dom = getDOM(fullscreenLogin.$el)
//     dom.style.zIndex = getZIndex()
//     fullscreenLogin.$appendTo(document.body)
//   },
//   closeDiv () {
//     if (!this.fullscreenLogin) return
//     let fullscreenLogin = this.fullscreenLogin
//     this.fullscreenLogin = null
//     fullscreenLogin.$remove(() => {
//       fullscreenLogin.$destroy()
//     })
//   }
// }
//
// export default MyUserWxBinding
