export default {
  routes: [
    {
      path: '/product',
      name: 'productList',
      component (resolve) {
        require(['VIEW/product/list'], resolve)
      }
    },
    {
      path: '/wxBindingList',
      name: 'wxBindingList',
      component (resolve) {
        require(['VIEW/wxBindingList'], resolve)
      }
    }
  ]
}
