export default {
  routes: [
    {
      path: '/stock_not_booking',
      name: 'search',
      component (resolve) {
        require(['VIEW/search/'], resolve)
      }
    },
    {
      path: '/stock/1/:info',
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
    },
    {
      path: 'stock/history/1',
      name: 'stockHistoryList',
      component (resolve) {
        require(['VIEW/stock/history/list'], resolve)
      }
    }
  ]
}
