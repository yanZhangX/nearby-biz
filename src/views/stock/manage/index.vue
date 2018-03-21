<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>库存管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="r">
        <el-button type="primary" icon="plus" @click="addStockModalAction">新增库存</el-button>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" v-loading.body="loading" stripe scope="scope" max-height=2000>
        <el-table-column prop="bookingDay" label="日期" min-width="100"></el-table-column>
        <el-table-column prop="bookingDay" label="星期" min-width="100">
          <template scope="scope">
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
          <template scope="scope">
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

    <el-dialog v-model="addStockModal" title="新增库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
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
            <li>
              <span class="info-span-title">库存数量：</span>
              <span>
                <el-input-number v-model="product.productStock" :min="0" :max="9999" label="请设置库存"></el-input-number>
              </span>
            </li>
            <li>
              <span class="info-span-title">可预约时间：</span>
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

    <el-dialog v-model="productStockModal" title="设置库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
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
  </div>
</template>

<script>
  import moment from 'moment'
  import router from 'ROUTE'
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
          productItemShowModal: false
        },
        stock: {
          stockId: null,
          stockAmount: 0
        },
        dateAppointmentOptions: {
          disabledDate: (startDate, endDate) => {
            return startDate <= Date.now()
          }
        }
      }
    },
    computed: {},
    methods: {
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
        this.$http.get('/v1/a/biz/stock/list', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage
          }
        }).then(res => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
            this.rowCount = res.body.data.rowCount
          }
        }).catch(res => {
          this.$message.error('服务器繁忙！')
        })
      },
      getProductAndItemData () {
        this.$http.get('/v1/a/biz/product', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage
          }
        }).then(res => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.products = res.body.data
          }
        }).catch(res => {
          this.$message.error('服务器繁忙！')
        })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      addStockModalAction () {
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
        this.getProductAndItemData()
        this.addStockModal = true
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
            params: {
              info: {
                id: row.stockId,
                operation: 'booking',
                pageIndex: this.currentPage,
                routeName: 'stockManage',
                routeMenu: '库存管理'
              }
            }
          }
        )
      },
      completeDetail (row) {
        router.push(
          {
            name: 'stockInfo',
            params: {
              info: {
                id: row.stockId,
                operation: 'complete',
                pageIndex: this.currentPage,
                routeName: 'stockManage',
                routeMenu: '库存管理'
              }
            }
          }
        )
      }
    },
    created () {
      var pageIndex = this.$route.params.pageIndex
      if (!this.paramIsNull(pageIndex)) {
        this.currentPage = parseInt(pageIndex)
      }
      this.getTableData()
    }
  }
</script>
