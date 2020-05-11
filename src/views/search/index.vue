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
    <div class="main-container" ref="mainTable">
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
      new Print().init()
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
        var loDop = new Print().getLodop()
        var strStyleCSS = '<style>.main-container {\n' +
          '    width: calc(100% - 40px);\n' +
          '    height: calc(100% - 40px - 50px);\n' +
          '    padding: 20px;\n' +
          '}\n' +
          '.el-table--fit {\n' +
          '    border-right: 0;\n' +
          '    border-bottom: 0;\n' +
          '}\n' +
          '.el-table {\n' +
          '    position: relative;\n' +
          '    overflow: hidden;\n' +
          '    box-sizing: border-box;\n' +
          '    flex: 1;\n' +
          '    width: 100%;\n' +
          '    max-width: 100%;\n' +
          '    font-size: 14px;\n' +
          '    color: #606266;\n' +
          '}\n' +
          '.el-table, .el-table__expanded-cell {\n' +
          '    background-color: #FFF;\n' +
          '}\n' +
          '.el-table::before {\n' +
          '    left: 0;\n' +
          '    bottom: 0;\n' +
          '    width: 100%;\n' +
          '    height: 1px;\n' +
          '}\n' +
          '.el-table--border::after, .el-table--group::after, .el-table::before {\n' +
          '    content: \'\';\n' +
          '    position: absolute;\n' +
          '    background-color: #EBEEF5;\n' +
          '    z-index: 1;\n' +
          '}\n' +
          '.el-table .hidden-columns {\n' +
          '    position: absolute;\n' +
          '    z-index: -1;\n' +
          '}\n' +
          '.el-pagination--small .arrow.disabled, .el-table .hidden-columns, .el-table td.is-hidden>*, .el-table th.is-hidden>*, .el-table--hidden {\n' +
          '    visibility: hidden;\n' +
          '}\n' +
          '.el-table__footer-wrapper, .el-table__header-wrapper {\n' +
          '    overflow: hidden;\n' +
          '}\n' +
          '.el-table__body-wrapper, .el-table__footer-wrapper, .el-table__header-wrapper {\n' +
          '    width: 100%;\n' +
          '}\n' +
          '.el-table__body, .el-table__footer, .el-table__header {\n' +
          '    table-layout: fixed;\n' +
          '    border-collapse: separate;\n' +
          '}\n' +
          '.el-table thead {\n' +
          '    color: #909399;\n' +
          '    font-weight: 500;\n' +
          '}\n' +
          '.el-table td, .el-table th.is-leaf {\n' +
          '    border-bottom: 1px solid #EBEEF5;\n' +
          '}\n' +
          '.el-table th {\n' +
          '    overflow: hidden;\n' +
          '    -ms-user-select: none;\n' +
          '    user-select: none;\n' +
          '}\n' +
          '.el-table td, .el-table th {\n' +
          '    padding: 12px 0;\n' +
          '    min-width: 0;\n' +
          '    box-sizing: border-box;\n' +
          '    text-overflow: ellipsis;\n' +
          '    vertical-align: middle;\n' +
          '    position: relative;\n' +
          '    text-align: left;\n' +
          '}\n' +
          'table thead th {\n' +
          '    height: 50px !important;\n' +
          '}\n' +
          'table thead tr, table thead th, table thead th div {\n' +
          '    background-color: #20A0FF !important;\n' +
          '}\n' +
          '.el-table th>.cell {\n' +
          '    display: inline-block;\n' +
          '    box-sizing: border-box;\n' +
          '    position: relative;\n' +
          '    vertical-align: middle;\n' +
          '    padding-left: 10px;\n' +
          '    padding-right: 10px;\n' +
          '    width: 100%;\n' +
          '}\n' +
          '.el-table .cell {\n' +
          '    box-sizing: border-box;\n' +
          '    overflow: hidden;\n' +
          '    text-overflow: ellipsis;\n' +
          '    white-space: normal;\n' +
          '    word-break: break-all;\n' +
          '    line-height: 23px;\n' +
          '    padding-right: 10px;\n' +
          '}\n' +
          'table thead th div {\n' +
          '    font-size: 14px !important;\n' +
          '    color: #FFFFFF !important;\n' +
          '}\n' +
          '.el-table__body-wrapper {\n' +
          '    overflow: hidden;\n' +
          '    position: relative;\n' +
          '}\n' +
          '.el-table th, .el-table tr {\n' +
          '    background-color: #FFF;\n' +
          '}\n' +
          '.el-table--enable-row-transition .el-table__body td {\n' +
          '    transition: background-color .25s ease;\n' +
          '}\n' +
          'table tbody .el-table__row--striped td {\n' +
          '    background: #F8F8F8 !important;\n' +
          '}</style>'
        var strFormHtml = '<head>' + strStyleCSS + '</head><body>' + this.$refs.mainTable.innerHTML + '</body>'
        loDop.PRINT_INIT('打印控件功能演示_Lodop功能_表单一')
        loDop.SET_PRINT_STYLE('FontSize', 18)
        loDop.SET_PRINT_STYLE('Bold', 1)
        loDop.ADD_PRINT_HTM(88, 50, 1146, 760, strFormHtml) // 增加超文本项
        loDop.SET_PREVIEW_WINDOW(1, 2, 0, 1146, 760, '') // 预览窗口
        loDop.SET_PRINT_PAGESIZE(1, 114.6, 76, 'CreateCustomPage') // 设定纸张大小
        loDop.SET_PRINT_MODE('PRINT_PAGE_PERCENT', 'Auto-Width') // 整页缩放
        loDop.PREVIEW()
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
