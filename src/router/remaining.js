export default {
  routes: [
    {
      path: '/remaining',
      name: 'remaining',
      component (resolve) {
        require(['VIEW/remaining'], resolve)
      }
    }
  ]
}
