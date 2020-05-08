<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>查询功能</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <el-select style="width: 270px" v-model="storeIndex" placeholder="请选择店铺" @change="storeChanged">
          <el-option v-for="(item, index) in storeList" :label="item.name" :key="index" :value="index"></el-option>
        </el-select>
        <el-select style="width: 270px" v-model="groupProductIndex" placeholder="请选择产品" @change="groupProductChanged">
          <el-option v-for="(item, index) in groupProductList" :label="item.name" :key="index" :value="index"></el-option>
        </el-select>
        <div class="k-search-contaienr">
          <el-date-picker type="daterange"
                          :editable="false"
                          v-model="selectDateSearch"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          @change="getTableData"
                          :picker-options="dateAppointmentOptions"></el-date-picker>
        </div>
      </div>

      <div class="r">
        <form ref="form" :action="downloadUrl" method="get">
          <el-button type="primary" icon="download" @click="printTable">打印</el-button>
          <el-button type="primary" icon="download" @click="exportExcelSelectDate">全部导出</el-button>
        </form>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe max-height=2000>
        <el-table-column prop="customerName" label="姓名" v-if="showCustomer" min-width="80"></el-table-column>
        <el-table-column prop="customerPhoneNumber" label="手机号" v-if="showCustomer" min-width="100"></el-table-column>
        <el-table-column prop="orderid" label="订单号" min-width="100"></el-table-column>
        <el-table-column prop="code" label="电子码" min-width="80"></el-table-column>
        <el-table-column prop="plusMoneyStr" label="加价" min-width="150">
          <template slot-scope="scope">
            <span v-html="scope.row.plusMoneyStr"></span>
          </template>
        </el-table-column>
        <el-table-column prop="completeDate" :formatter="dateFormat" label="核销时间" min-width="100"></el-table-column>
        <el-table-column prop="title" label="产品名称" min-width="200"></el-table-column>
        <el-table-column prop="subTitle" label="套餐" min-width="100"></el-table-column>
        <el-table-column prop="completeMemo" label="核销备注" min-width="100"></el-table-column>
        <el-table-column prop="supplierName" label="核销店铺" min-width="100"></el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>0">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :visible.sync="selectDateModal" title="导出日期选择">
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form ref="form" :model="info" label-width="140px" :inline-message="true" label-position="left">
            <el-form-item label="导出日期：">
              <el-date-picker type="daterange"
                              :editable="false"
                              range-separator="至"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期"
                              v-model="selectDate"
                              :picker-options="dateAppointmentOptions"></el-date-picker>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="selectDateModal = false">关闭</el-button>
          <el-button type="primary" @click="exportExcel">确定导出</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import moment from 'moment'
  import {appHost, getToken, getUser} from 'CONST'
  import Print from '@/print'
  export default {
    name: 'stock',
    data () {
      return {
        stock: {
          id: '',
          stockNumber: ''
        },
        focusStatus: true,
        tableData: null,
        keywords: '',
        loading: false,
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0,
        travelTicket: false,
        itemList: [],
        completeSettingModal: false,
        completeSettingDate: false,
        selectDateModal: false,
        selectDate: null,
        bookingItemId: null,
        completeDay: null,
        info: {
          customerName: '',
          customerPhoneNumber: '',
          bookingCustomerName: '',
          bookingCustomerPhoneNumber: '',
          status: 0,
          bookingDate: '',
          bookingDateText: '',
          completeDate: '',
          createDate: '',
          code: '',
          statusText: '',
          bookingMemo: '',
          bookingItemText: '',
          bookingItems: [],
          completeMemo: null
        },
        storeList: null,
        storeIndex: null,
        store: {
          name: null,
          bizUid: null,
          status: null
        },
        showCustomer: false,
        groupProductList: null,
        groupProductIndex: null,
        groupProduct: {
          productGroupId: null,
          name: null
        },
        downloadUrl: '',
        selectDateSearch: null,
        dateAppointmentOptions: {
          disabledDate: (startDate) => {
            return startDate > Date.now()
          }
        }
      }
    },
    computed: {},
    created () {
      if (getUser().showCustomer) {
        this.showCustomer = true
      }
      this.getStoreList()
      this.getGroupProductList()
      this.getTableData()
    },
    methods: {
      getUserName () {
        var reg = /^(.).*$/
        if (!this.paramIsNull(this.info.bookingCustomerName)) {
          return this.info.bookingCustomerName.replace(reg, '$1**')
        } else if (!this.paramIsNull(this.info.customerName)) {
          return this.info.customerName.replace(reg, '$1**')
        }
        return ''
      },
      getUserPhoneNumber () {
        var reg = /(\d{3})\d{4}(\d{4})/
        if (!this.paramIsNull(this.info.bookingCustomerPhoneNumber)) {
          return this.info.bookingCustomerPhoneNumber.replace(reg, '$1****$2')
        } else if (!this.paramIsNull(this.info.customerPhoneNumber)) {
          return this.info.customerPhoneNumber.replace(reg, '$1****$2')
        }
        return ''
      },
      dateFormat (row) {
        if (row.completeDate) {
          return moment(row.completeDate).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      myDateFormat (date) {
        if (date) {
          return moment(date).format('YYYY-MM-DD')
        } else {
          return ''
        }
      },
      storeChanged () {
        this.currentPage = (this.pageIndex !== 0 ? this.pageIndex : 1)
        this.pageIndex = 0
        this.store = this.storeList[this.storeIndex]
        this.getTableData()
      },
      getStoreList () {
        this.$http.get('/v1/a/biz/store/list').then(res => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.storeList = res.body.data
            let size = this.storeList.length
            for (let i = 0; i < size; i++) {
              if (this.storeList[i].status === 1 && this.storeList[i].bizUid === getUser().id) {
                this.storeIndex = i
                break
              }
            }
          }
        })
      },
      groupProductChanged () {
        this.currentPage = (this.pageIndex !== 0 ? this.pageIndex : 1)
        this.pageIndex = 0
        this.groupProduct = this.groupProductList[this.groupProductIndex]
        this.getTableData()
      },
      getGroupProductList () {
        this.$http.get('/v1/a/biz/group/product/list').then(res => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.groupProductList = res.body.data
            if (this.groupProductList && this.groupProductList.length > 0) {
              this.groupProductIndex = 0
            }
          }
        })
      },
      getTableData () {
        if (!this.groupProduct) {
          this.$message.error('请选择产品')
          return
        }
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        var date = 0
        var endDate = 0
        if (!this.paramIsNull(this.selectDateSearch)) {
          if (!this.paramIsNull(this.selectDateSearch[0])) {
            date = this.selectDateSearch[0].getTime()
          }
          if (!this.paramIsNull(this.selectDateSearch[1])) {
            endDate = this.selectDateSearch[1].getTime()
          }
        }
        this.$http.get('/v1/a/biz/code/list', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage,
            status: this.store.status,
            bizUid: this.store.bizUid,
            productGroupId: this.groupProduct.productGroupId,
            date: date,
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
      setInventory (row) {
        this.stock = row
        this.isModalOpen = true
      },
      printTable () {
        var lodop = new Print({ a: 1 }, 1, 2, 3).getLodop()
        console.log(lodop)
      },
      exportExcelSelectDate () {
        if (this.tableData === null || this.tableData.length === 0) {
          this.pro_message_error(null, '没有数据可导出')
          return
        }
        this.selectDate = null
        this.selectDateModal = true
      },
      exportExcel () {
        if (this.paramIsNull(this.selectDate)) {
          this.pro_message_error(null, '请选择日期')
          return
        }
        var startDate = this.selectDate[0]
        var endDate = this.selectDate[1]

        if (this.paramIsNull(startDate) || this.paramIsNull(endDate)) {
          this.pro_message_error(null, '请选择日期')
          return
        }

        this.selectDateModal = false
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认导出（'),
            h('span', {style: 'color: red;'}, `${this.pro_yyyyMMDD(null, null, startDate)}`),
            h('span', null, '至'),
            h('span', {style: 'color: red;'}, `${this.pro_yyyyMMDD(null, null, endDate)}`),
            h('span', null, '）这段时间的核销数据吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认导出',
          cancelButtonText: '再考虑一下',
          type: 'warning',
          center: true
        }).then(() => {
          this.downloadUrl = `${appHost()}/v1/a/biz/complete/all/day/download?productGroupId=${this.groupProduct.productGroupId}&bizUid=${this.store.bizUid}&token=${getToken()}&status=${this.store.status}&date=${startDate.getTime()}&endDate=${endDate.getTime()}`
          window.open(this.downloadUrl)
        }).catch(e => {
          this.selectDateModal = true
        })
      }
    }
  }
</script>
