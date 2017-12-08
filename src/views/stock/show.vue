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
        <el-button type="primary" icon="download" @click="exportExcel" v-if="operation === 'complete'">全部导出</el-button>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe max-height="500" @row-click="">
        <el-table-column prop="customerName" label="客户姓名"></el-table-column>
        <el-table-column prop="customerPhoneNumber" label="客户手机"></el-table-column>
        <el-table-column prop="code" label="电子码" min-width="200"  v-if="operation === 'complete'"></el-table-column>
        <el-table-column prop="createDate" label="下单时间" :formatter="timeDesc" min-width="150"></el-table-column>
        <el-table-column prop="bookingTime" label="预约时间" :formatter="timeDesc" min-width="150" v-if="operation === 'booking'"></el-table-column>
        <el-table-column prop="completeDate" label="核销时间" :formatter="completeDate" min-width="150" v-if="operation === 'complete'"></el-table-column>
        <el-table-column prop="bookingMemo" label="备注" min-width="150"></el-table-column>
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
        pageIndex: 1
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
      goList () {
        router.push({name: 'stockManage', params: {pageIndex: this.pageIndex}})
      },
      exportExcel () {
        if (this.tableData === null || this.tableData.length === 0) {
          this.$message.error('没有数据')
          return
        }
        this.$http.get(`/v1/a/biz/complete/day/download?id=${this.$route.params.id}`, {
          params: {
            pageSize: this.total,
            pageIndex: this.currentPage
          }
        }).then(res => {
          if (res.body.errMesage) {
            this.$message.error(res.body.errMessage)
          } else {
            window.location.href = res.body.data
          }
        }).catch(e => {
          this.$message.error('服务器繁忙！')
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
