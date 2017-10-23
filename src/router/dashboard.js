export default {
  routes: [
    {
      path: '/dashboard',
      name: 'Dashbord',
      component (resolve) {
        require(['VIEW/dashboard'], resolve)
      }
    }
  ]
}
