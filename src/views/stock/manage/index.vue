<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>库存管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <el-select style="width: 270px" v-model="bookingItemIndex" placeholder="请选择预约型号" @change="bookingItemChanged">
          <el-option v-for="(item, index) in bookingItemList" :label="item.name" :key="index" :value="index"></el-option>
        </el-select>
        <div class="k-search-contaienr">
          <el-date-picker type="daterange"
                          :editable="false"
                          v-model="selectDateSearch"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          :picker-options="dateAppointmentOptions"
                          @change="bookingItemChanged"></el-date-picker>
        </div>
      </div>
      <div class="r">
        <el-button class="uploader" type="primary" @click="exportExcelSelectDate">导出预约</el-button>
        <el-button type="primary" icon="plus" @click="getProductAndItemData(1)">新增库存</el-button>
        <el-button type="primary" @click="getProductAndItemData(2)" v-if="debugMode">批量修改库存</el-button>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" v-loading.body="loading" stripe scope="scope" max-height=2000>
        <el-table-column prop="bookingDay" label="日期" min-width="100"></el-table-column>
        <el-table-column prop="bookingDay" label="星期" min-width="100">
          <template slot-scope="scope">
            <span v-if="isDateWeekend(scope.row)" style="color: red">{{weekFormat(scope.row)}}</span>
            <span v-else>{{weekFormat(scope.row)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bookingItemText" label="型号"></el-table-column>
        <el-table-column prop="plusMoneyStr" label="加价"></el-table-column>
        <el-table-column prop="stockAmount" label="库存量"></el-table-column>
        <el-table-column prop="bookingAmount" label="已预约"></el-table-column>
        <el-table-column prop="completeAmount" label="已核销"></el-table-column>
        <el-table-column prop="statusStr" label="库存状态" minWidth="200" v-if="debugMode">
          <template slot-scope="scope">
            <div>
              <span v-html="scope.row.statusStr" v-if="scope.row.status === 0"></span>
              <span v-html="scope.row.statusStr" v-if="scope.row.status === 2" style="color: red;"></span>
              <br/>
              <span v-if="scope.row.status === 0">(<el-button type="text" @click.stop="updateStockStatus(scope.row)">点击关闭库存</el-button>)</span>
              <span v-if="scope.row.status === 2">(<el-button type="text" @click.stop="updateStockStatus(scope.row)">点击开启库存</el-button>)</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <div>
              <el-button type="text" @click.stop="manageProductStock(scope.row)">管理库存</el-button>
              <el-button type="text" @click.stop="bookingDetail(scope.row)">查看预约</el-button>
              <el-button type="text" @click.stop="completeDetail(scope.row)">查看核销</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>0">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :visible.sync="switches.addStockModal" title="新建库存">
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form :model="product"  label-width="160px">
            <el-form-item label="预约库存型号：" prop="selectedItemKindIndex" :rules="[{required: true, message: '必填'}]">
              <el-select v-model="product.selectedItemKindIndex" style="width: 100%" @change="productItemKindSelecteChanged" >
                <el-option v-for="(item, index) in product.kinds" :key="index" :label="item.bookingItemText" :value="index"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="预约时间范围：" prop="dateAppointmentDate" :rules="[{required: true, message: '必填'}]">
              <el-date-picker type="daterange"
                              :editable="true"
                              v-model="product.dateAppointmentDate"
                              range-separator="至"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期"
                              value-format="timestamp"
                              :picker-options="dateAppointmentOptions"
                              style="width: 100%"></el-date-picker>
            </el-form-item>
            <el-form-item label="按周新建：" v-if="switches.addStockModal && switches.modeAddStock === 0">
              <el-checkbox-group v-model="product.weekList">
                <el-checkbox v-for="(item, index) in weekEnum" :key="index" :label="item.value">{{item.name}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="每日库存数量：" prop="productStock" :rules="[{required: true, message: '必填'}]">
              <el-input-number v-model="product.productStock"></el-input-number>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div style="text-align:center">
          <el-button type="primary" @click="addStock()">新建库存</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="switches.stockBatchModifyModal" title="批量修改库存">
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <li>
              <span class="info-span-title">预约库存型号：</span>
              <span>
                <el-select v-model="product.selectedItemKindIndex" placeholder="请选择预约库存型号"  @change="productItemKindSelecteChanged" style="width: 60%;">
                  <el-option v-for="(item, index) in product.kinds" :key="item.id" :label="item.bookingItemText" :value="index"></el-option>
                </el-select>
              </span>
            </li>
          </ul>
        </div>

      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="switches.stockBatchModifyModal = false">关闭</el-button>
          <el-button type="primary" @click="stockBatchModify">确认</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="switches.productStockModal" title="设置库存">
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form :model="stock" label-width="100px">
            <el-form-item label="库存：" v-if="stock!==null">
              <el-input-number v-model="stock.stockAmount" :min="0" label="请设置库存" ></el-input-number>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="switches.productStockModal = false">关闭</el-button>
        <el-button type="primary" @click="prodcutStockChange">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="selectDateModal" title="导出日期选择">
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form ref="form" label-width="140px" :inline-message="true" label-position="left">
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
  const weekEnum = [{name: '周一', value: 2}, {name: '周二', value: 3}, {name: '周三', value: 4}, {name: '周四', value: 5}, {name: '周五', value: 6}, {name: '周六', value: 7}, {name: '周日', value: 1}]
  import moment from 'moment'
  import router from 'ROUTE'
  import {appHost, getToken, isDebug} from 'CONST'
  export default {
    name: 'stockManage',
    data () {
      return {
        weekEnum,
        debugMode: false,
        tableData: null,
        products: null,
        loading: false,
        currentPage: 1,
        pageSize: 10,
        total: null,
        rowCount: 0,
        pageCount: 0,
        switches: {
          addStockModal: false,
          modeAddStock: 0, // 0代表按周添加，1代表按日期添加
          stockBatchModifyModal: false,
          productStockModal: false
        },
        product: {
          kinds: [],
          productItemKindId: null,
          selectedItemKindIndex: null,
          productStock: 0,
          day: '',
          dateAppointmentDate: [],
          selectDate: [],
          weekList: []
        },
        stock: {
          stockId: null,
          stockAmount: 0
        },
        dateAppointmentOptions: {
          disabledDate: (startDate, endDate) => {
            return startDate < Date.now() - 60 * 60 * 24 * 1000
          }
        },
        bookingItemList: null,
        bookingItemIndex: null,
        bookingItem: {
          id: null,
          name: null
        },
        selectDateModal: false,
        selectDate: null,
        selectDateSearch: null
      }
    },
    computed: {},
    created () {
      var pageIndex = this.$route.query.pageIndex
      if (!this.paramIsNull(pageIndex)) {
        this.currentPage = parseInt(pageIndex)
      }
      var bookingItemIndex = this.$route.query.bookingItemIndex
      if (!this.paramIsNull(bookingItemIndex)) {
        this.bookingItemIndex = parseInt(bookingItemIndex)
      }
      var selectDateSearch = decodeURI(this.$route.query.selectDateSearch)
      if (!this.paramIsNull(selectDateSearch)) {
        selectDateSearch = selectDateSearch.split(',')
        if (!this.paramIsNull(selectDateSearch)) {
          this.selectDateSearch = [new Date(selectDateSearch[0]), new Date(selectDateSearch[1])]
        }
      }
      this.debugMode = isDebug
      this.getBookingItemList()
    },
    methods: {
      bookingItemChanged () {
        this.currentPage = 1
        this.bookingItem = this.bookingItemList[this.bookingItemIndex]
        this.getTableData()
      },
      getBookingItemList () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/a/biz/stock/booking/item/config').then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.bookingItemList = res.body.data
            if (this.bookingItemList && this.bookingItemList.length > 0) {
              if (this.paramIsNull(this.bookingItemIndex)) {
                this.bookingItemIndex = 0
              }
            }
            this.bookingItem = this.bookingItemList[this.bookingItemIndex]
            this.getTableData()
          }
        }).catch(e => {
          loading.close()
          this.pro_message_error(null, '服务器错误')
        })
      },
      paramIsNull (param) {
        if (typeof (param) === 'undefined' || param === null) {
          return true
        }
        return false
      },
      dateFormat (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD')
        } else {
          return ''
        }
      },
      weekFormat (row) {
        if (row.date) {
          let date = new Date(row.date)
          let week = ''
          let weekDay = date.getDay()
          switch (weekDay) {
            case 0:
              week = '星期日'
              break
            case 1:
              week = '星期一'
              break
            case 2:
              week = '星期二'
              break
            case 3:
              week = '星期三'
              break
            case 4:
              week = '星期四'
              break
            case 5:
              week = '星期五'
              break
            case 6:
              week = '星期六'
              break
          }
          return `${week}`
        } else {
          return row.bookingDay || ''
        }
      },
      isDateWeekend (row) {
        let date = new Date(row.date)
        const weekDay = date.getDay()
        return weekDay === 5 || weekDay === 6
      },
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        var startDate = null
        var endDate = null
        if (!this.paramIsNull(this.selectDateSearch)) {
          startDate = this.selectDateSearch[0].getTime()
          endDate = this.selectDateSearch[1].getTime()
        }
        this.$http.get('/v1/a/biz/stock/list', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage,
            bookingItemId: this.bookingItem.id,
            startDate: startDate,
            endDate: endDate
          }
        }).then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageSize = res.body.data.pageSize
            this.pageCount = res.body.data.pageCount
            this.rowCount = res.body.data.rowCount
          }
        }).catch(res => {
          loading.close()
          this.$message.error('服务器繁忙！')
        })
      },
      getProductAndItemData (type) {
        if (!this.paramIsNull(this.products)) {
          this.stockManager(type)
        }
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/a/biz/stock/booking/item').then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.products = res.body.data
            if (!this.paramIsNull(this.products)) {
              this.stockManager(type)
            } else {
              this.pro_message_error(null, '数据错误')
            }
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
      stockManager (type) {
        if (this.paramIsNull(this.products)) {
          this.pro_message_error(null, '数据错误')
          return
        }
        this.product.kinds = this.products
        this.product.productStock = 0
        this.product.day = null
        this.product.productItemKindId = null
        this.product.dateAppointmentDate = null
        this.product.selectedItemKindIndex = null
        this.product.selectDate = []
        if (type === 1) { // 新增库存
          this.switches.addStockModal = true
        } else if (type === 2) { // 批量修改库存
          this.switches.stockBatchModifyModal = true
//          this.stockBatchModify()
        } else {
          this.pro_message_error(null, '数据错误')
        }
      },
      addStock () {
        if (this.paramIsNull(this.product.productItemKindId)) {
          this.$message.error('请选择要创建的预约库存型号')
          return
        }
        if (this.paramIsNull(this.product.productStock) || this.product.productStock === 0) {
          this.$message.error('请设置已选预约库存型号的每日库存数量')
          return
        }
        if (this.paramIsNull(this.product.dateAppointmentDate) || this.product.dateAppointmentDate.length < 2) {
          this.$message.error('请选择已选预约库存型号的可预约时间范围')
          return
        }

        var start = this.product.dateAppointmentDate[0]
        var end = this.product.dateAppointmentDate[1]
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('div', null, '新建库存信息确认：'),
            h('div', {style: 'color: red;'}, `预约库存型号：${this.product.kinds[this.product.selectedItemKindIndex].bookingItemText}`),
            h('div', {style: 'color: red;'}, `每日库存数量：${this.product.productStock}`),
            h('div', {style: 'color: red;'}, `预约时间范围：${this.dateFormat(null, null, start)}至${this.dateFormat(null, null, end)}`)
          ]),
          showCancelButton: true,
          confirmButtonText: '确认无误新增',
          cancelButtonText: '再检查一下',
          type: 'warning',
          center: true
        }).then(() => {
          this.$http.post('/v1/a/biz/stock/add', {
            s: this.product.productStock,
            bookingItemId: this.product.productItemKindId,
            status: 0,
            dayStart: moment(start).format('YYYY-MM-DD'),
            dayEnd: moment(end).format('YYYY-MM-DD'),
            weekList: this.product.weekList
          }).then((res) => {
            if (res.body.errMessage) {
              this.$message({
                showClose: true,
                message: res.body.errMessage,
                type: 'error'
              })
            } else {
              this.$message({
                showClose: true,
                message: '新建「' + this.product.kinds[this.product.selectedItemKindIndex].bookingItemText + '」的库存成功',
                type: 'success'
              })
              this.switches.addStockModal = false
              this.getTableData()
            }
          })
        })
      },
      stockBatchModify () {
        if (this.paramIsNull(this.product.productItemKindId)) {
          this.pro_message_error(null, '请选择预约库存型号')
          return
        }
        router.push({
          name: 'batchModifyStock',
          query: {
            id: this.product.productItemKindId
          }
        })
      },
      productItemKindSelecteChanged () {
        if (this.paramIsNull(this.product.selectedItemKindIndex)) {
          return
        }
        this.product.productItemKindId = this.product.kinds[this.product.selectedItemKindIndex].id
      },
      manageProductStock (row) {
        this.stock.stockId = row.stockId
        this.stock.stockAmount = row.stockAmount
        this.switches.productStockModal = true
      },
      prodcutStockChange () {
        this.$http.post(`/v1/a/biz/stock?id=${this.stock.stockId}&s=${this.stock.stockAmount}`).then(function (res) {
          if (res.body.errMessage) {
            this.$message({
              showClose: true,
              message: res.body.errMessage,
              type: 'error'
            })
          } else {
            this.$message({
              showClose: true,
              message: '设置成功',
              type: 'success'
            })
            this.switches.productStockModal = false
            this.getTableData()
          }
        }).catch(function (res) {
          this.$message({
            showClose: true,
            message: '服务器连接超时',
            type: 'error'
          })
        })
      },
      bookingDetail (row) {
        router.push(
          {
            name: 'stockInfo',
            query: {
              id: row.stockId,
              operation: 'booking',
              pageIndex: this.currentPage,
              routeName: 'stockManage',
              routeMenu: encodeURI('库存管理'),
              selectDateSearch: encodeURI(this.selectDateSearch),
              bookingItemIndex: this.bookingItemIndex
            }
          }
        )
      },
      completeDetail (row) {
        router.push(
          {
            name: 'stockInfo',
            query: {
              id: row.stockId,
              operation: 'complete',
              pageIndex: this.currentPage,
              routeName: 'stockManage',
              routeMenu: encodeURI('库存管理'),
              selectDateSearch: encodeURI(this.selectDateSearch),
              bookingItemIndex: this.bookingItemIndex
            }
          }
        )
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
            h('span', null, '）这段时间的预约数据吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认导出',
          cancelButtonText: '再考虑一下',
          type: 'warning',
          center: true
        }).then(() => {
          this.downloadUrl = `${appHost()}/v1/a/biz/booking/all/day/download?bookingItemId=${this.bookingItem.id}&token=${getToken()}&date=${startDate.getTime()}&endDate=${endDate.getTime()}`
          window.open(this.downloadUrl)
        }).catch(e => {
          this.selectDateModal = true
        })
      },
      updateStockStatus (row) {
        if (this.paramIsNullAndZero(row.stockId)) {
          this.pro_message_error(null, '数据错误')
          return
        }
        var message = null
        var status = null
        if (row.status === 0) {
          message = '关闭'
          status = 2
        } else if (row.status === 2) {
          message = '开启'
          status = 0
        } else {
          this.pro_message_error(null, '数据错误')
          return
        }

        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认要' + message + '('),
            h('span', {style: 'color: red;'}, row.bookingItemText),
            h('span', null, ')('),
            h('span', {style: 'color: red;'}, row.bookingDay),
            h('span', null, ')的库存吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认' + message,
          cancelButtonText: '再考虑一下',
          type: 'warning',
          center: true
        }).then(() => {
          var loading = this.$loading({
            lock: true,
            text: '设置中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.post(`/v1/a/biz/stock/status/update`, {
            stockId: row.stockId,
            status: status
          }).then(function (res) {
            loading.close()
            if (res.body.errMessage) {
              this.pro_message_error(null, res.body.errMessage)
              this.$message({
                showClose: true,
                message: res.body.errMessage,
                type: 'error'
              })
            } else {
              this.pro_message_success(res.body.data)
              this.getTableData()
            }
          }).catch(function (res) {
            loading.close()
            this.pro_message_error('服务器错误')
          })
        }).catch(e => {
        })
      }
    }
  }
</script>
