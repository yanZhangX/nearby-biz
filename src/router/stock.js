export default {
  routes: [
    {
      path: '/stock',
      name: 'stock',
      component (resolve) {
        require(['VIEW/stock'], resolve)
      }
    },
    {
      path: '/stock/:id',
      name: 'stockInfo',
      component (resolve) {
        require(['VIEW/stock/show'], resolve)
      }
    }
  ]
}
