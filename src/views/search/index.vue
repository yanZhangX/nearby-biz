<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>查询</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <div class="k-search-contaienr">
          <i class="el-icon-search k-center" @click="search"></i>
          <input type="text" placeholder="请输入电子码" v-focus class="k-search-input" v-model="keywords" @keyup.enter="search">
        </div>
        <el-select style="width: 270px" v-model="storeIndex" placeholder="请选择店铺" @change="storeChanged">
          <el-option v-for="(item, index) in storeList" :label="item.name" :key="index" :value="index"></el-option>
        </el-select>
      </div>

      <div class="r">
        <form ref="form" :action="downloadUrl" method="get">
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
        <el-table-column prop="completeDate" :formatter="dateFormat" label="核销时间" min-width="100"></el-table-column>
        <el-table-column prop="title" label="产品名称" min-width="200"></el-table-column>
        <el-table-column prop="subTitle" label="套餐" min-width="100"></el-table-column>
        <el-table-column prop="completeMemo" label="核销备注" min-width="100"></el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>0">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :visible.sync="travelTicket" title="电子码信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape >
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form ref="form" :model="info" label-width="140px" :inline-message="true" label-position="left">
            <el-form-item label="套餐内容：">
              {{info.subTitle}}
            </el-form-item>
            <el-form-item label="下单时间：">
              {{info.createDate | infoTimeFormatter('yyyy-MM-dd hh:mm:ss')}}
            </el-form-item>
            <el-form-item label="电子码：">
              <span>{{info.code}}</span>
              <span>{{getUserName()}}</span>
              <span>{{getUserPhoneNumber()}}</span>
            </el-form-item>
            <el-form-item label="状态：">
              <span>{{info.statusText}}</span>
              <span>{{info.bookingDateText}}</span>
              <span>{{info.bookingItemText}}</span>
            </el-form-item>
            <el-form-item label="产品型号选择：" v-if="completeSettingModal">
              <el-radio-group v-model="bookingItemId" size="small">
                <el-radio  v-for="(item, index) in info.bookingItems" :label="item.id" :key="index">{{item.bookingItemText}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="到店时间选择：" v-if="completeSettingDate">
              <el-date-picker type="date"
                              :editable="false"
                              placeholder="请选择到店时间"
                              v-model="completeDay"
                              :clearable="false"></el-date-picker>
            </el-form-item>
            <el-form-item label="订单备注：">
              {{info.memo}}
            </el-form-item>
            <el-form-item label="预约备注：">
              {{info.bookingMemo}}
            </el-form-item>
            <el-form-item label="核销备注：">
              <span v-if="info.status === 1 || info.status === 2"><el-input v-model="info.completeMemo" size="small" placeholder="请输入核销备注" style="width: 70%;"></el-input></span>
              <span v-else>{{info.completeMemo}}</span>
            </el-form-item>
          </el-form>
        </div>

        <div class="complete-container" v-if="info.status === 3">
          <img src="/static/img/home/complete.png" alt="">
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="travelTicket = false">关闭</el-button>
          <el-button type="primary" @click="del(info)" v-if="info.status === 1 || info.status === 2">核销</el-button>
        </div>
      </div>
    </el-dialog>

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
                              v-model="selectDate"></el-date-picker>
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
        showCustomer: false
      }
    },
    computed: {},
    created () {
      if (getUser().showCustomer) {
        this.showCustomer = true
      }
      this.getStoreList()
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
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/a/biz/code/list', {
          params: {
            pageSize: this.pageSize,
            order: this.sortType,
            pageIndex: this.currentPage,
            status: this.store.status,
            bizUid: this.store.bizUid
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
      search () {
        if (this.keywords) {
          var loading = this.$loading({
            lock: true,
            text: '查询中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.get('/v1/a/biz/code', {
            params: {
              c: this.keywords
            }
          }).then((res) => {
            loading.close()
            if (res.body.errMessage) {
              this.$message({
                showClose: true,
                message: res.body.errMessage,
                type: 'error'
              })
            } else {
              this.completeDay = new Date()
              this.info = res.body.data
              this.info.bookingDateText = this.myDateFormat(this.info.bookingDay)
              this.travelTicket = true
              if (typeof (this.info.bookingItems) !== 'undefined' && this.info.bookingItems !== null && this.info.bookingItems.length > 0) {
                this.bookingItemId = this.info.bookingItems[0].id
                this.completeSettingModal = true
              } else {
                this.completeSettingModal = false
              }
            }
          }).catch(e => {
            loading.close()
            this.$message.error('服务器错误')
          })
        }
      },
      del (row) {
        this.travelTicket = false
        this.$confirm('确定核销吗？', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var memo = this.info.completeMemo
          if (this.paramIsNull(memo)) {
            memo = ''
          }
          var url = `/v1/a/biz/code?c=${row.code}&memo=${memo}`
          if (this.info.status === 1 && this.info.booking === 1) {
            url = `/v1/a/biz/code?c=${row.code}&memo=${memo}&bookingItemId=${this.bookingItemId}&bookingDay=${this.completeDay.getTime()}`
          }
          var loading = this.$loading({
            lock: true,
            text: '核销中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.post(url).then(function (res) {
            loading.close()
            if (res.body.errMessage) {
              this.$message({
                showClose: true,
                message: res.body.errMessage,
                type: 'error'
              })
            } else {
              this.$message({
                showClose: true,
                message: '核销成功',
                type: 'success'
              })
              this.isModalOpen = false
              this.getTableData()
            }
          }).catch(function (res) {
            loading.close()
            this.$message({
              showClose: true,
              message: '服务器连接超时',
              type: 'error'
            })
          })
        })
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
          this.downloadUrl = `${appHost()}/v1/a/biz/complete/all/day/download?bizUid=${this.store.bizUid}&token=${getToken()}&status=${this.store.status}&date=${startDate.getTime()}&endDate=${endDate.getTime()}`
          window.open(this.downloadUrl)
        }).catch(e => {
          this.selectDateModal = true
        })
      }
    }
  }
</script>
