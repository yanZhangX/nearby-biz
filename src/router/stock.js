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
      path: '/stock/1/:operation/id/pageIndex',
      name: 'stockInfo',
      component (resolve) {
        require(['VIEW/stock/show'], resolve)
      }
    },
    {
      path: '/stock/:pageIndex',
      name: 'stockManage',
      component (resolve) {
        require(['VIEW/stock/manage'], resolve)
      }
    }
  ]
}
