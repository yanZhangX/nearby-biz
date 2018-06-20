<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>库存管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <el-select style="width: 270px" v-model="groupProductIndex" placeholder="请选择产品" @change="groupProductChanged">
          <el-option v-for="(item, index) in groupProductList" :label="item.name" :key="index" :value="index"></el-option>
        </el-select>
      </div>
      <div class="r">
        <el-button class="uploader" type="primary" @click="exportExcelSelectDate">导出预约</el-button>
        <el-button type="primary" icon="plus" @click="getProductAndItemData(1)">新增库存</el-button>
        <!--<el-button type="primary" @click="getProductAndItemData(2)">批量修改库存</el-button>-->
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
        <el-table-column prop="stockAmount" label="库存量"></el-table-column>
        <el-table-column prop="bookingAmount" label="已预约"></el-table-column>
        <el-table-column prop="completeAmount" label="已核销"></el-table-column>
        <el-table-column prop="name" label="产品名称"></el-table-column>
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
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :visible.sync="addStockModal" title="新增库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <li>
              <span class="info-span-title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;产品名称：</span>
              <span>
                <el-select v-model="product.selectedProductIndex" placeholder="请选择产品名称" @change="productSelecteChanged" style="width: 60%;">
                  <el-option v-for="(item, rowIndex) in products" :key="item.id" :label="item.name" :value="rowIndex"></el-option>
                </el-select>
              </span>
            </li>
            <li>
              <span class="info-span-title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;套餐名称：</span>
              <span>
                <el-select v-model="product.selectedProductItemIndex" placeholder="请选择套餐名称" @change="productItemSelecteChanged" no-data-text="请先选择产品名称" style="width: 60%;">
                  <el-option v-for="(item, rowIndex) in product.items" :key="item.id" :label="item.subTitle" :value="rowIndex"></el-option>
                </el-select>
              </span>
            </li>
            <li v-if="product.productItemShowModal">
              <span class="info-span-title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;产品型号：</span>
              <span>
                <el-select v-model="product.selectedItemKindIndex" placeholder="请选择产品型号"  @change="productItemKindSelecteChanged" no-data-text="请先选择套餐名称" style="width: 60%;">
                  <el-option v-for="(item, index) in product.kinds" :key="item.id" :label="item.bookingItemText" :value="index"></el-option>
                </el-select>
              </span>
            </li>
            <li>
              <span class="info-span-title">每日库存数量：</span>
              <span>
                <el-input-number v-model="product.productStock" :min="0" :max="9999" label="请设置库存"></el-input-number>
              </span>
            </li>
            <li>
              <span class="info-span-title">&nbsp;&nbsp;&nbsp;可预约时间：</span>
              <span>
                <el-date-picker  style="width: 60%;"
                                 v-model="product.dateAppointmentDate"
                                 type="daterange"
                                 placeholder="请选择可预约日期"
                                 range-separator="至"
                                 :picker-options="dateAppointmentOptions">
                </el-date-picker>
              </span>
            </li>
          </ul>
        </div>

      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="addStockModal = false">关闭</el-button>
          <el-button type="primary" @click="addStock">新增</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="stockBatchModifyModal" title="批量修改库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <li>
              <span class="info-span-title">产品名称：</span>
              <span>
                <el-select v-model="product.selectedProductIndex" placeholder="请选择产品名称" @change="productSelecteChanged" style="width: 60%;">
                  <el-option v-for="(item, rowIndex) in products" :key="item.id" :label="item.name" :value="rowIndex"></el-option>
                </el-select>
              </span>
            </li>
            <li>
              <span class="info-span-title">套餐名称：</span>
              <span>
                <el-select v-model="product.selectedProductItemIndex" placeholder="请选择套餐名称" @change="productItemSelecteChanged" no-data-text="请先选择产品名称" style="width: 60%;">
                  <el-option v-for="(item, rowIndex) in product.items" :key="item.id" :label="item.subTitle" :value="rowIndex"></el-option>
                </el-select>
              </span>
            </li>
            <li v-if="product.productItemShowModal">
              <span class="info-span-title">产品型号：</span>
              <span>
                <el-select v-model="product.selectedItemKindIndex" placeholder="请选择产品型号"  @change="productItemKindSelecteChanged" no-data-text="请先选择套餐名称" style="width: 60%;">
                  <el-option v-for="(item, index) in product.kinds" :key="item.id" :label="item.bookingItemText" :value="index"></el-option>
                </el-select>
              </span>
            </li>
          </ul>
        </div>

      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="stockBatchModifyModal = false">关闭</el-button>
          <el-button type="primary" @click="stockBatchModify">确认</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="productStockModal" title="设置库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
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
        <el-button @click="productStockModal = false">关闭</el-button>
        <el-button type="primary" @click="prodcutStockChange">确定</el-button>
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
  import router from 'ROUTE'
  import {appHost, getToken} from 'CONST'
  export default {
    name: 'stockManage',
    data () {
      return {
        tableData: null,
        products: null,
        loading: false,
        currentPage: 1,
        pageSize: 15,
        total: null,
        rowCount: 0,
        pageCount: 0,
        addStockModal: false,
        stockBatchModifyModal: false,
        productStockModal: false,
        product: {
          selectedProductIndex: null,
          productId: '',
          items: [],
          kinds: [],
          productItemId: null,
          productItemKindId: null,
          selectedProductItemIndex: null,
          selectedItemKindIndex: null,
          productStock: 10,
          day: '',
          dateAppointmentDate: [],
          productItemShowModal: false,
          selectDate: []
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
        groupProductList: null,
        groupProductIndex: null,
        groupProduct: {
          productGroupId: null,
          name: null
        },
        selectDateModal: false,
        selectDate: null
      }
    },
    computed: {},
    created () {
      var pageIndex = this.$route.query.pageIndex
      if (!this.paramIsNull(pageIndex)) {
        this.currentPage = parseInt(pageIndex)
      }
      this.getGroupProductList()
      this.getTableData()
    },
    methods: {
      groupProductChanged () {
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
        if (row.bookingDay) {
          var date = new Date(row.bookingDay)
          var week = ''
          var weekDay = date.getDay()
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
              this.textStyle = 'color: red;'
              break
            case 6:
              week = '星期六'
              this.textStyle = 'color: red;'
              break
          }
          return `${week}`
        } else {
          return row.bookingDay
        }
      },
      isDateWeekend (row) {
        var date = new Date(row.bookingDay)
        var weekDay = date.getDay()
        if (weekDay === 5 || weekDay === 6) {
          return true
        } else {
          return false
        }
      },
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/a/biz/stock/list', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage,
            productGroupId: this.groupProduct.productGroupId
          }
        }).then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
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
        this.$http.get('/v1/a/biz/product', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage
          }
        }).then(res => {
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
        this.product.selectedProductIndex = null
        this.product.productId = null
        this.product.items = []
        this.product.kinds = []
        this.product.productItemId = null
        this.product.selectedProductItemIndex = null
        this.product.productStock = 0
        this.product.day = null
        this.product.productItemKindId = null
        this.product.dateAppointmentDate = null
        this.product.selectedItemKindIndex = null
        this.product.selectDate = []
        if (type === 1) { // 新增库存
          this.addStockModal = true
        } else if (type === 2) { // 批量修改库存
          this.stockBatchModifyModal = true
//          this.stockBatchModify()
        } else {
          this.pro_message_error(null, '数据错误')
        }
      },
      addStock () {
        if (this.paramIsNull(this.product.productId)) {
          this.$message.error('请选择产品')
          return
        }
        if (this.paramIsNull(this.product.productItemId)) {
          this.$message.error('请选择套餐')
          return
        }
        if (!this.paramIsNull(this.product.kinds) && this.product.kinds.length !== 0 && this.paramIsNull(this.product.productItemKindId)) {
          this.$message.error('请选择产品型号')
          return
        }
        if (this.paramIsNull(this.product.productStock) || this.product.productStock === 0) {
          this.$message.error('请设置库存数量')
          return
        }
        if (this.paramIsNull(this.product.dateAppointmentDate) || this.product.dateAppointmentDate.length < 2) {
          this.$message.error('请选择可预约日期')
          return
        }
        var start = this.product.dateAppointmentDate[0]
        var end = Date.parse(this.product.dateAppointmentDate[1])
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('div', null, '新增产品库存信息确认：'),
            h('div', {style: 'color: red;'}, `产品：${this.products[this.product.selectedProductIndex].name}`),
            h('div', {style: 'color: red;'}, `套餐：${this.product.items[this.product.selectedProductItemIndex].subTitle}`),
            h('div', {style: 'color: red;'}, `型号：${this.product.kinds[this.product.selectedItemKindIndex].bookingItemText}`),
            h('div', {style: 'color: red;'}, `库存：${this.product.productStock}`),
            h('div', {style: 'color: red;'}, `预约日期：${this.dateFormat(null, null, start)}至${this.dateFormat(null, null, end)}`)
          ]),
          showCancelButton: true,
          confirmButtonText: '确认无误新增',
          cancelButtonText: '再检查一下',
          type: 'warning',
          center: true
        }).then(() => {
          this.$http.post('/v1/a/biz/stock/add', {
            s: this.product.productStock,
            productItemId: this.product.productItemId,
            bookingItemId: (this.product.productItemKindId === null) ? 0 : this.product.productItemKindId,
            status: 0,
            dayStart: moment(start).format('YYYY-MM-DD'),
            dayEnd: moment(end).format('YYYY-MM-DD')
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
                message: '新增库存成功',
                type: 'success'
              })
              this.addStockModal = false
              this.getTableData()
            }
          })
        })
      },
      stockBatchModify () {
        if (this.paramIsNull(this.product.productItemKindId)) {
          this.pro_message_error(null, '请选择产品型号')
          return
        }
        router.push({
          name: 'batchModifyStock',
          query: {
            id: this.product.productItemKindId
          }
        })
      },
      initAppointmentStartAndEndDate () {
        var start = new Date()
        var end = new Date()
        start.setTime(start.getTime() + 3600 * 1000 * 24)
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 7)
        this.product.dateAppointmentDate = [start, end]
      },
      productSelecteChanged () {
        let product = this.products[this.product.selectedProductIndex]
        this.product.productId = product.id
        this.product.items = product.items
        this.product.selectedProductItemIndex = null
        this.product.productItemKindId = null
        this.productItemSelecteChanged()
      },
      productItemSelecteChanged () {
        if (this.product.selectedProductItemIndex === null) {
          return
        }
        var item = this.product.items[this.product.selectedProductItemIndex]
        this.product.productItemId = item.id
        this.product.kinds = item.items
        this.product.productItemKindId = null
        if (this.paramIsNull(this.product.kinds) || this.product.kinds.length === 0) {
          this.product.productItemShowModal = false
        } else {
          this.product.productItemShowModal = true
        }
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
        this.productStockModal = true
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
            this.productStockModal = false
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
              routeMenu: encodeURI('库存管理')
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
              routeMenu: encodeURI('库存管理')
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
          this.downloadUrl = `${appHost()}/v1/a/biz/booking/all/day/download?productGroupId=${this.groupProduct.productGroupId}&token=${getToken()}&date=${startDate.getTime()}&endDate=${endDate.getTime()}`
          window.open(this.downloadUrl)
        }).catch(e => {
          this.selectDateModal = true
        })
      }
    }
  }
</script>
