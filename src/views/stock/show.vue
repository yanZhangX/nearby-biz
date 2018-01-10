<template>
  <div class="stockInfo">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <span @click="goList">库存管理</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{operationStr}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">

      </div>
      <div class="r">
        <form ref="form" :action="downloadUrl" method="get">
          <el-button type="primary" icon="download" @click="exportExcel" v-if="operation === 'complete' || operation === 'booking'">全部导出</el-button>
        </form>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" v-loading.body="loading" stripe max-height=2000 @row-click="">
        <el-table-column prop="bookingCustomerName" label="客户姓名" min-width="100" :formatter="bookingCustomerNameFormat"></el-table-column>
        <el-table-column prop="bookingCustomerPhoneNumber" label="客户手机" min-width="150" :formatter="bookingCustomerPhoneNumberFormat"></el-table-column>
        <el-table-column prop="code" label="电子码" min-width="140" v-if="operation === 'complete'"></el-table-column>
        <el-table-column prop="bookingDay" label="预约时间" min-width="200" :formatter="timeDesc" v-if="operation === 'booking'"></el-table-column>
        <el-table-column prop="completeDate" label="核销时间" min-width="200" :formatter="completeDate" v-if="operation === 'complete'"></el-table-column>
        <el-table-column prop="bookingMemo" label="备注" min-width="150"></el-table-column>
        <el-table-column label="操作" min-width="100" v-if="operation === 'booking'" fixed="right">
          <template scope="scope">
            <el-button type="text" @click="confirmBookingItem(scope.row)" v-if="scope.row.sure !== 'undefined' && scope.row.sure === 0">确认</el-button>
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
  import {appHost, getToken} from 'CONST'

  export default {
    name: 'stockInfo',
    data () {
      return {
        tableData: null,
        keywords: '',
        loading: true,
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0,
        operationStr: '',
        requestUrl: '',
        operation: '',
        pageIndex: 1,
        downloadUrl: null
      }
    },
    computed: {
    },
    filters: {
      infoTimeFormatter (v) {
        return moment(v).format('YYYY-MM-DD HH:mm')
      }
    },
    methods: {
      getTableData () {
        this.loading = false
        this.$http.get(this.requestUrl + this.$route.params.id, {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage
          }
        }).then(res => {
          this.loading = false
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
          }
        }).catch(res => {
          this.loading = false
          this.$message.error('服务器繁忙！')
        })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      timeDesc (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD')
        } else {
          return ''
        }
      },
      completeDate (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      bookingCustomerNameFormat (row, col, val) {
        if (row.bookingCustomerName) {
          return row.bookingCustomerName
        } else {
          return row.customerName
        }
      },
      bookingCustomerPhoneNumberFormat (row, col, val) {
        if (row.bookingCustomerPhoneNumber) {
          return row.bookingCustomerPhoneNumber
        } else {
          return row.customerPhoneNumber
        }
      },
      goList () {
        router.push({name: 'stockManage', params: {pageIndex: this.pageIndex}})
      },
      exportExcel () {
        if (this.tableData === null || this.tableData.length === 0) {
          if (this.operation === 'complete') {
            this.$message.error('没有核销数据')
          } else if (this.operation === 'booking') {
            this.$message.error('没有预约数据')
          } else {
            this.$message.error('没有数据')
          }
          return
        }
        if (this.operation === 'complete') {
          this.downloadUrl = `${appHost()}/v1/a/biz/complete/day/download?id=${this.$route.params.id}&token=${getToken()}`
          window.open(this.downloadUrl)
        } else if (this.operation === 'booking') {
          this.downloadUrl = `${appHost()}/v1/a/biz/booking/day/download?id=${this.$route.params.id}&token=${getToken()}`
          window.open(this.downloadUrl)
        }
      },
      confirmBookingItem (row) {
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认已经知晓用户（'),
            h('pan', {style: 'color: red;'}, `${this.bookingCustomerNameFormat(row, null, null)}：${this.bookingCustomerPhoneNumberFormat(row, null, null)}`),
            h('span', null, '）的预约信息了吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.$http.post(`/v1/a/biz/order/sure?orderId=${row.orderId}`).then(res => {
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success('确认操作成功')
              this.getTableData()
            }
          }).catch(e => {
            this.$message.error('服务器错误')
          })
        })
      }
    },
    created () {
      this.operation = this.$route.params.operation
      if (this.operation === 'booking') {
        this.requestUrl = '/v1/a/biz/booking/day?id='
        this.operationStr = '查看预约'
      } else if (this.operation === 'complete') {
        this.requestUrl = '/v1/a/biz/complete/day?id='
        this.operationStr = '查看核销'
      }
      this.getTableData()
      this.pageIndex = this.$route.params.pageIndex
    }
  }
</script>
