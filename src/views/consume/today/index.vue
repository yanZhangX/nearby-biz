<template>
  <div class="stockInfo">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>今日预约</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <div class="k-search-contaienr">
          <i class="el-icon-search k-center" @click="search"></i>
          <input type="text" placeholder="电子码、手机、姓名" class="k-search-input" v-model="keywords" @keyup.enter="search" v-focus>
        </div>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" v-loading.body="loading" stripe max-height=2000 @row-click="">
        <el-table-column prop="bookingCustomerName" label="客户姓名" min-width="100" :formatter="bookingCustomerNameFormat"></el-table-column>
        <el-table-column prop="bookingCustomerPhoneNumber" label="客户手机" min-width="120" :formatter="bookingCustomerPhoneNumberFormat"></el-table-column>
        <el-table-column prop="code" label="电子码" min-width="100"></el-table-column>
        <el-table-column prop="bookingDay" label="预约时间" min-width="120" :formatter="pro_yyyyMMDD" ></el-table-column>
        <el-table-column prop="completeDate" label="核销时间" min-width="120" :formatter="completeDate"></el-table-column>
        <el-table-column prop="bookingMemo" label="备注" min-width="120"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="120"></el-table-column>
        <el-table-column label="操作" min-width="80" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="onClickConsume(true, scope.row.code)" v-if="scope.row.status === 2">核销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>0">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <consume :code="code" :type="1" v-if="isWillConsume"></consume>
  </div>
</template>

<script>
  import moment from 'moment'
  import Consume from 'COMPONENT/consume'

  export default {
    name: 'consumeToday',
    components: {Consume},

    data () {
      return {
        tableData: null,
        keywords: '',
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0,
        pageIndex: 1,
        downloadUrl: null,
        supplierList: [],
        row: null,
        supplierId: null,
        isWillConsume: false,
        code: ''
      }
    },
    created () {
      this.getTableData()
    },
    methods: {
      onUpdate () {
        this.getTableData()
      },
      onClickConsume (isWillConsume, code) {
        this.code = code
        this.isWillConsume = isWillConsume
      },
      paramIsNull (param) {
        if (typeof (param) === 'undefined' || param === null) {
          return true
        }
        return false
      },
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/a/biz/booking/today', {
          params: {
            search: this.keywords,
            pageSize: this.pageSize,
            pageIndex: this.currentPage
          }
        }).then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
          }
        }).catch(res => {
          loading.close()
          this.$message.error('服务器繁忙！')
        })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      search () {
        this.currentPage = 1
        this.getTableData()
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
      }
    }
  }
</script>
