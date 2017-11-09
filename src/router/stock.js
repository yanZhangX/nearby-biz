export default {
  routes: [
    {
      path: '/stock_not_booking',
      name: 'stock',
      component (resolve) {
        require(['VIEW/stock'], resolve)
      }
    },
    {
      path: '/stock_not_booking/:id',
      name: 'stockInfo',
      component (resolve) {
        require(['VIEW/stock/show'], resolve)
      }
    }
  ]
}
