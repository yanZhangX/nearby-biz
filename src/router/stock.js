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
      path: '/stock/:operation/:id',
      name: 'stockInfo',
      component (resolve) {
        require(['VIEW/stock/show'], resolve)
      }
    },
    {
      path: '/stock',
      name: 'stockManage',
      component (resolve) {
        require(['VIEW/stock/manage'], resolve)
      }
    }
  ]
}
