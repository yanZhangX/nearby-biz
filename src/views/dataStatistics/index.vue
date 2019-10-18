<template>
  <div class="dataStatistics">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <el-select class="wp100"
                    remote
                    filterable
                    clearable
                    :remote-method="getCompanyList"
                    :loading="optionLoading"
                    placeholder="搜索店铺"
                    @change="companyChange"
                    @focus="getCompanyList('')"
                    v-model="mainForm.companyId">
            <el-option v-for="(e,i) in companyList" :key="i" :label="e.name" :value="e.id"></el-option>
            <!-- <el-option :label="'只显示' + companyList.length + '条，搜索以显示更多'" value="_noValue" disabled v-if="companyList.length >= 50"></el-option> -->
        </el-select>
        <div class="k-search-contaienr">
          <el-date-picker type="daterange"
                          :editable="false"
                          v-model="selectDateSearch"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          :picker-options="dateAppointmentOptions"
                          @change="dataItemChanged"></el-date-picker>
        </div>
      </div>
      <div class="r right-view">
        <div class="total-number">总核销量：{{totalSaleNum}}</div>
        <el-button type="primary" class="export-btn" @click="exportExcelData">导出数据</el-button>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" v-loading.body="loading" stripe scope="scope" max-height=2000>
        <el-table-column prop="name" label="店铺"></el-table-column>
        <el-table-column prop="clearSaleNum" label="核销量"></el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>0">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
                     layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import {appHost, getToken} from 'CONST'
  export default {
    data () {
      return {
        tableData: null,
        loading: false,
        currentPage: 1,
        pageSize: 10,
        total: null,
        rowCount: 0,
        pageCount: 0,
        mainForm: {
          companyId: null,
          companyName: ''
        },
        totalSaleNum: 0,
        optionLoading: false,
        companyList: [],
        dateAppointmentOptions: {
          disabledDate: (startDate, endDate) => {
            return startDate > new Date()
          }
        },
        bookingItem: {
          id: null,
          name: null
        },
        selectDateSearch: null
      }
    },
    created () {
      var pageIndex = this.$route.query.pageIndex
      if (!this.paramIsNull(pageIndex)) {
        this.currentPage = parseInt(pageIndex)
      }
      var selectDateSearch = decodeURI(this.$route.query.selectDateSearch)
      if (!this.paramIsNull(selectDateSearch)) {
        selectDateSearch = selectDateSearch.split(',')
        if (!this.paramIsNull(selectDateSearch)) {
          this.selectDateSearch = [new Date(selectDateSearch[0]), new Date(selectDateSearch[1])]
        }
      }
      this.getTableData()
    },
    methods: {
      dataItemChanged () {
        this.currentPage = 1
        this.getTableData()
      },
      paramIsNull (param) {
        if (typeof (param) === 'undefined' || param === null) {
          return true
        }
        return false
      },
      allParams () {
        var startDate = null
        var endDate = null
        if (JSON.stringify(this.selectDateSearch[0]) !== 'null' && JSON.stringify(this.selectDateSearch[1]) !== 'null') {
          startDate = this.selectDateSearch[0].getTime()
          endDate = this.selectDateSearch[1].getTime()
        }
        return {
          pageSize: this.pageSize,
          pageIndex: this.currentPage,
          startDate: startDate,
          endDate: endDate,
          childUserId: this.mainForm.companyId
        }
      },
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/a/biz/order/clearSales/statistics', {
          params: this.allParams()
        }).then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.totalSaleNum = res.body.data.totalSaleNum
            this.tableData = res.body.data.pagingData.data
            this.total = res.body.data.pagingData.rowCount
            this.pageCount = res.body.data.pagingData.pageCount
            this.rowCount = res.body.data.pagingData.rowCount
          }
        }).catch(res => {
          loading.close()
          this.$message.error('服务器繁忙！')
        })
      },
      getCompanyList (keywords) {
        return new Promise((resolve, reject) => {
          // if (!keywords) return reject()
          this.optionLoading = true
          if (/\s+/.test(keywords)) return reject()
          let params = {
            search: keywords
            // showAll: 0,
            // permission: 0,
            // pageSize: 50
          }
          this.$http.get('/v1/a/biz/shops', {params}, false)
            .then(res => {
              this.companyList = res.data.data || []
              this.optionLoading = false
              resolve()
            })
            .catch(e => {
              reject()
              this.$message.error('服务器繁忙！')
            })
        })
      },
      companyChange () {
        this.dataItemChanged()
        if (this.companyList.length > 0) {
          this.mainForm.companyName = this.companyList.filter((list) => {
            return list.id === this.mainForm.companyId
          }).map((item) => {
            return item.name
          })[0]
        }
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      exportExcelData () {
        if (this.paramIsNull(this.tableData)) {
          this.pro_message_error(null, '没有数据可导出')
          return
        }
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认要导出数据吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认导出',
          cancelButtonText: '再考虑一下',
          type: 'warning',
          center: true
        }).then(() => {
          let {startDate, childUserId, endDate} = this.allParams()
          startDate = startDate || ''
          childUserId = childUserId || ''
          endDate = endDate || ''
          var url = `${appHost()}/v1/a/order/clearSales/download?token=${getToken()}&startDate=${startDate}&endDate=${endDate}&childUserId=${childUserId}`
          window.open(url)
        }).catch(e => {})
      }
    }
  }
</script>


<style lang="scss" scoped>
.total-number{
    color: #333;
}
.right-view{
    display: flex;
    align-items: center;
}
.export-btn{
    color: #fff;
    margin-left: 10px;
}
</style>
