export default {
  routes: [
    {
      path: '/bookingSureList/1',
      name: 'bookingSureList',
      component (resolve) {
        require(['VIEW/bookingSureList/list'], resolve)
      }
    }
  ]
}
