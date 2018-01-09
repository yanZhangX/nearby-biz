<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>预约确定列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe scope="scope" max-height="500">
        <el-table-column prop="bookingCustomerName" label="客户姓名" min-width="100" :formatter="bookingCustomerNameFormat"></el-table-column>
        <el-table-column prop="bookingCustomerPhoneNumber" label="客户手机" min-width="150" :formatter="bookingCustomerPhoneNumberFormat"></el-table-column>
        <el-table-column prop="bookingDay" label="预约时间" min-width="200" :formatter="bookingDay"></el-table-column>
        <el-table-column prop="memo" label="预约备注" min-width="100"></el-table-column>
        <el-table-column prop="createDate" :formatter="createDate" label="确定时间" min-width="100"></el-table-column>
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
  export default {
    data () {
      return {
        tableData: null,
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0
      }
    },
    methods: {
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
      bookingDay (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD')
        } else {
          return ''
        }
      },
      createDate (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      getTableData () {
        this.$http.get('/v1/a/biz/order/sure/list', {
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
          }
        }).catch(res => {
          this.$message.error('服务器繁忙！')
        })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      }
    },
    created () {
      this.getTableData()
    }
  }
</script>
