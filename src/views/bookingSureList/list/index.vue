<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>预约确定列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <el-select style="width: 270px" v-model="bookingItemIndex" placeholder="请选择产品" @change="bookingItemChanged">
          <el-option v-for="(item, index) in bookingItemList" :label="item.name" :key="index" :value="index"></el-option>
        </el-select>
        <el-select v-model="type" placeholder="请选择类型" @change="bookingTypeChanged">
          <el-option v-for="item in bookingTypeList" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <div class="k-search-contaienr">
          <el-date-picker type="daterange"
                          :editable="false"
                          v-model="selectDateSearch"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          @change="search"></el-date-picker>
        </div>
        <div class="k-search-contaienr">
          <i class="el-icon-search k-center" @click="search"></i>
          <input type="text" placeholder="电子码、手机、姓名" class="k-search-input" v-model="keywords" @keyup.enter="search" v-focus>
        </div>
      </div>
      <div class="r">
        <el-button class="uploader" type="primary" @click="exportExcelSelectDate">导出预约</el-button>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" stripe scope="scope" max-height=2000>
        <el-table-column prop="bookingCustomerName" label="客户姓名" min-width="100" :formatter="bookingCustomerNameFormat"></el-table-column>
        <el-table-column prop="bookingCustomerPhoneNumber" label="客户手机" min-width="150" :formatter="bookingCustomerPhoneNumberFormat"></el-table-column>
        <el-table-column prop="bookingDay" label="预约时间" min-width="100" :formatter="pro_yyyyMMDD"></el-table-column>
        <el-table-column prop="bookingItemText" label="预约类型" min-width="100"></el-table-column>
        <el-table-column prop="bookingMemo" label="预约备注" min-width="100">
          <template slot-scope="scope">
            <span>{{scope.row.bookingMemo}}</span>&nbsp;&nbsp;<span>{{scope.row.memo}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="确定时间" min-width="160">
          <template slot-scope="scope">
            <span v-html="pro_yyyyMMDD(null, null, scope.row.createDate)" v-if="!paramIsNull(scope.row.sure) && scope.row.sure === 1"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="confirmBookingItem(scope.row)" v-if="!paramIsNull(scope.row.sure) && scope.row.sure === 0">预约确认</el-button>
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
  import {appHost, getToken} from 'CONST'
  export default {
    data () {
      return {
        keywords: null,
        tableData: null,
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0,
        type: null,
        bookingTypeList: [
          {
            id: 1,
            name: '未确认'
          },
          {
            id: 0,
            name: '已确认'
          }
        ],
        bookingItemList: null,
        bookingItemIndex: null,
        bookingItem: {
          id: null,
          name: null
        },
        selectDateSearch: null
      }
    },
    created () {
      this.type = 1
      this.getBookingItemList()
      this.getTableData()
    },
    methods: {
      bookingItemChanged () {
        this.bookingItem = this.bookingItemList[this.bookingItemIndex]
        this.getTableData()
      },
      getBookingItemList () {
        this.$http.get('/v1/a/biz/stock/booking/item/config').then(res => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.bookingItemList = res.body.data
            if (this.bookingItemList && this.bookingItemList.length > 0) {
              this.bookingItemIndex = 0
            }
          }
        })
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
      search () {
        this.currentPage = 1
        this.getTableData()
      },
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        var beginDate = null
        var endDate = null
        if (!this.paramIsNull(this.selectDateSearch)) {
          beginDate = this.selectDateSearch[0].getTime()
          endDate = this.selectDateSearch[1].getTime()
        }
        this.$http.get(`/v1/a/biz/order/sure/list?type=${this.type}`, {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage,
            bookingItemId: this.bookingItem.id,
            search: this.keywords,
            beginDate: beginDate,
            endDate: endDate
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
      confirmBookingItem (row) {
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认已经知晓用户（'),
            h('span', {style: 'color: red;'}, `${this.bookingCustomerNameFormat(row, null, null)}：${this.bookingCustomerPhoneNumberFormat(row, null, null)}`),
            h('span', null, '）的预约信息了吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          var loading = this.$loading({
            lock: true,
            text: '设置中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.post(`/v1/a/biz/order/sure?orderId=${row.orderId}`).then(res => {
            loading.close()
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success('确认操作成功')
              this.getTableData()
            }
          }).catch(e => {
            loading.close()
            this.$message.error('服务器错误')
          })
        })
      },
      bookingTypeChanged () {
        this.currentPage = 1
        this.getTableData()
      },
      exportExcelSelectDate () {
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
          var beginDate = 0
          var endDate = 0
          if (!this.paramIsNull(this.selectDateSearch)) {
            beginDate = this.selectDateSearch[0].getTime()
            endDate = this.selectDateSearch[1].getTime()
          }
          var bookingItemId = 0
          if (!this.paramIsNull(this.bookingItem.id)) {
            bookingItemId = this.bookingItem.id
          }
          console.log(bookingItemId)
          var search = ''
          if (!this.paramIsNull(this.keywords)) {
            search = this.keywords
          }
          var url = `${appHost()}/v1/a/booking/sure/list?bookingItemId=${bookingItemId}&token=${getToken()}&search=${search}&type=${this.type}&beginDate=${beginDate}&endDate=${endDate}`
          window.open(url)
        }).catch(e => {})
      }
    }
  }
</script>
