<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>历史库存</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">

    </div>
    <div class="main-container">
      <el-table :data="tableData" v-loading.body="loading" stripe scope="scope" max-height=2000>
        <el-table-column prop="bookingDay" label="日期" min-width="100"></el-table-column>
        <el-table-column prop="bookingDay" label="星期" min-width="100">
          <template slot-scope="scope">
            <span v-if="isDateWeekend(scope.row)" style="color: red">{{weekFormat(scope.row)}}</span>
            <span v-else>{{weekFormat(scope.row)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bookingItemText" label="型号"></el-table-column>
        <el-table-column prop="stockAmount" label="库存量"></el-table-column>
        <el-table-column prop="bookingAmount" label="已预约"></el-table-column>
        <el-table-column prop="completeAmount" label="已核销"></el-table-column>
        <el-table-column prop="name" label="产品名称"></el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <div>
              <el-button type="text" @click.stop="bookingDetail(scope.row)">查看预约</el-button>
              <el-button type="text" @click.stop="completeDetail(scope.row)">查看核销</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
                     layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import router from 'ROUTE'
  export default {
    data () {
      return {
        tableData: null,
        products: null,
        loading: false,
        currentPage: 1,
        pageSize: 15,
        total: null,
        rowCount: 0,
        pageCount: 0,
        addStockModal: false,
        productStockModal: false,
        product: {
          selectedProductIndex: null,
          productId: '',
          items: [],
          kinds: [],
          productItemId: null,
          productItemKindId: null,
          selectedProductItemIndex: null,
          selectedItemKindIndex: null,
          productStock: 10,
          day: '',
          dateAppointmentDate: [],
          productItemShowModal: false
        },
        stock: {
          stockId: null,
          stockAmount: 0
        },
        dateAppointmentOptions: {
          disabledDate: (startDate, endDate) => {
            return startDate <= new Date()
          }
        }
      }
    },
    computed: {},
    methods: {
      paramIsNull (param) {
        if (typeof (param) === 'undefined' || param === null) {
          return true
        }
        return false
      },
      dateFormat (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD')
        } else {
          return ''
        }
      },
      weekFormat (row) {
        if (row.bookingDay) {
          var date = new Date(row.bookingDay)
          var week = ''
          var weekDay = date.getDay()
          switch (weekDay) {
            case 0:
              week = '星期日'
              break
            case 1:
              week = '星期一'
              break
            case 2:
              week = '星期二'
              break
            case 3:
              week = '星期三'
              break
            case 4:
              week = '星期四'
              break
            case 5:
              week = '星期五'
              this.textStyle = 'color: red;'
              break
            case 6:
              week = '星期六'
              this.textStyle = 'color: red;'
              break
          }
          return `${week}`
        } else {
          return row.bookingDay
        }
      },
      isDateWeekend (row) {
        var date = new Date(row.bookingDay)
        var weekDay = date.getDay()
        if (weekDay === 5 || weekDay === 6) {
          return true
        } else {
          return false
        }
      },
      getTableData () {
        this.$http.get('/v1/a/biz/stock/list/history', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage
          }
        }).then(res => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
            this.rowCount = res.body.data.rowCount
          }
        }).catch(res => {
          this.$message.error('服务器繁忙！')
        })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      bookingDetail (row) {
        router.push(
          {
            name: 'stockInfo',
            params: {
              info: {
                id: row.stockId,
                operation: 'booking',
                pageIndex: this.currentPage,
                routeName: 'stockHistoryList',
                routeMenu: '历史库存'
              }
            }
          }
        )
      },
      completeDetail (row) {
        router.push(
          {
            name: 'stockInfo',
            params: {
              info: {
                id: row.stockId,
                operation: 'complete',
                pageIndex: this.currentPage,
                routeName: 'stockHistoryList',
                routeMenu: '历史库存'
              }
            }
          }
        )
      }
    },
    created () {
      var pageIndex = this.$route.params.pageIndex
      if (!this.paramIsNull(pageIndex)) {
        this.currentPage = parseInt(pageIndex)
      }
      this.getTableData()
    }
  }
</script>
