export default {
  routes: [
    {
      path: '/consume',
      name: 'consume',
      component (resolve) {
        require(['VIEW/consume/'], resolve)
      }
    },
    {
      path: '/consume/today',
      name: 'consumeToday',
      component (resolve) {
        require(['VIEW/consume/today'], resolve)
      }
    },
    {
      path: '/consume/multiple',
      name: 'consumeMultiple',
      component (resolve) {
        require(['VIEW/consume/multiple'], resolve)
      }
    },
    {
      path: '/stock_not_booking',
      name: 'search',
      component (resolve) {
        require(['VIEW/search/'], resolve)
      }
    },
    {
      path: '/stock/show',
      name: 'stockInfo',
      component (resolve) {
        require(['VIEW/stock/show'], resolve)
      }
    },
    {
      path: '/stock/1',
      name: 'stockManage',
      component (resolve) {
        require(['VIEW/stock/manage'], resolve)
      }
    },
    {
      path: '/stock/history/1',
      name: 'stockHistoryList',
      component (resolve) {
        require(['VIEW/stock/history/list'], resolve)
      }
    },
    {
      path: '/delivery/list/1',
      name: 'deliveryList',
      component (resolve) {
        require(['VIEW/delivery/list'], resolve)
      }
    },
    {
      path: '/stock/manager/batch/modify',
      name: 'batchModifyStock',
      component (resolve) {
        require(['VIEW/stock/batchModifyStock'], resolve)
      }
    },
    {
      path: '/dataStatistics',
      name: 'dataStatistics',
      component (resolve) {
        require(['VIEW/dataStatistics/'], resolve)
      }
    }
  ]
}
