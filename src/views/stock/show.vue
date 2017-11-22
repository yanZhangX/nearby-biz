<template>
  <div class="stockInfo">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item to="/stock">库存管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{operationStr}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">

      </div>
      <div class="r">

      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe max-height="500" @row-click="">
        <el-table-column prop="customerName" label="客户姓名"></el-table-column>
        <el-table-column prop="customerPhoneNumber" label="客户电话" min-width="200"></el-table-column>
        <el-table-column prop="createDate" label="下单时间" :formatter="timeDesc" min-width="150"></el-table-column>
        <el-table-column prop="bookingDate" label="预约时间" :formatter="timeDesc" min-width="150" v-if="operation === 'booking'"></el-table-column>
        <el-table-column prop="bookingDate" label="核销时间" :formatter="timeDesc" min-width="150" v-if="operation === 'complete'"></el-table-column>
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
        operation: ''
      }
    },
    computed: {},
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

      timeDesc (row, col) {
        return moment(row[col.property]).format('YYYY-MM-DD HH:mm')
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
    }
  }
</script>
