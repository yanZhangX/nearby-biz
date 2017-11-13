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

      </div>
      <div class="r">
        <!--<el-button type="primary" icon="plus" @click="addStockModalAction">新增库存</el-button>-->
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe scope="scope" max-height="500">
        <el-table-column prop="orderid" label="订单号"></el-table-column>
        <!--<el-table-column prop="customerName" label="顾客姓名"></el-table-column>-->
        <!--<el-table-column prop="customerPhoneNumber" label="顾客手机号"></el-table-column>-->
        <el-table-column prop="code" label="电子码"></el-table-column>
        <el-table-column prop="completeDate" :formatter="dateFormat" label="核销时间" min-width="100"></el-table-column>
        <el-table-column prop="title" label="产品名称" min-width="200"></el-table-column>
        <el-table-column prop="subTitle" label="套餐" min-width="100"></el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <div  class="filter">
      <span>已完成订单核销：共{{this.rowCount}}条</span>
    </div>

    <el-dialog v-model="isModalOpen" title="设置库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form :model="stock" label-width="100px">
            <el-form-item label="库存：">
              <el-input type="text"  placeholder="请输入库存" v-model="stock.stockNumber"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isModalOpen = false">关闭</el-button>
        <el-button type="primary" @click="handleChange">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog v-model="travelTicket" title="电子码信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape >
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <!--<li><span>游客姓名：</span><span>{{info.customerName}}</span></li>-->
            <!--<li><span>游客电话：</span><span>{{info.customerPhoneNumber}}</span></li>-->
            <!--<li><span>预定时间：</span><span>{{info.bookingDate | infoTimeFormatter('yyyy-MM-dd hh:mm:ss')}}</span></li>-->
            <!--<li><span>完成时间：</span><span>{{info.completeDate | infoTimeFormatter('yyyy-MM-dd hh:mm:ss')}}</span></li>-->
            <li><span>下单时间：</span><span>{{info.createDate | infoTimeFormatter('yyyy-MM-dd hh:mm:ss')}}</span></li>
            <li><span>电子码：</span><span>{{info.code}}</span></li>
            <li><span>状态：</span><span>{{info.statusText}}</span></li>
          </ul>
        </div>

      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="travelTicket = false">关闭</el-button>
          <el-button type="primary" @click="del(info)" v-if="info.status === 1 || info.status === 2">核销</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="addStockModal" title="新增库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <li>
              <span>产品名称：</span>
              <span>
                <el-select v-model="product.selectedProductIndex" placeholder="请选择产品名称" @change="productComboSelected" style="width: 100%;">
                  <el-option v-for="(item, rowIndex) in productCombos" :key="item.id" :label="item.title" :value="rowIndex"></el-option>
                </el-select>
              </span>
            </li>
            <li>
              <span>套餐名称：</span>
              <span>
                <el-select v-model="product.productItemId" placeholder="请选择套餐名称" no-data-text="请先选择产品名称" style="width: 100%;">
                  <el-option v-for="item in productCombo.items" :key="item.id" :label="item.subTitle" :value="item.id"></el-option>
                </el-select>
              </span>
            </li>
            <li>
              <span>库存数量：</span>
              <span>
                <el-input v-model="product.s" placeholder="请库存数量" size="small"></el-input>
              </span>
            </li>
            <li>
              <span>可预约时间：</span>
              <span>
                <el-date-picker  style="width: 100%;" v-model="product.dateAppointmentDate" type="daterange" start-placeholder="请选择开始日期" end-placeholder="请选择结束日期" range-separator="至" :picker-options="dateAppointmentOptions"></el-date-picker>
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
  </div>
</template>

<script>
  import moment from 'moment'
  import router from 'ROUTE'
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
        rowCount: 0,
        importLoading: false,
        isModalOpen: false,
        travelTicket: false,
        addStockModal: false,
        info: {
          customerName: '',
          customerPhoneNumber: '',
          status: '',
          bookingDate: '',
          completeDate: '',
          createDate: '',
          code: '',
          statusText: ''
        },
        productCombos: [],
        productCombo: {
          items: []
        },
        product: {
          selectedProductIndex: '',
          s: '',
          productItemId: '',
          day: '',
          dateAppointmentDate: []
        },
        dateAppointmentOptions: {
          disabledDate: (startDate, endDate) => {
            return startDate <= new Date()
          }
        }
      }
    },
    computed: {},
    methods: {
      dateFormat (row) {
        if (row.completeDate) {
          return moment(row.completeDate).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      getTableData () {
        this.$http.get('/v1/a/biz/code/list', {
          params: {
            pageSize: this.pageSize,
            order: this.sortType,
            pageIndex: this.currentPage,
            status: this.state
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
      getData () {
        this.$http.get('/v1/a/biz/code/list', {
          params: {
            pageSize: this.pageSize,
            order: this.sortType,
            pageIndex: this.currentPage,
            status: this.state
          }
        }).then(res => {
          console.log('/v1/a/biz/code/list \n' + res)
        }).catch(res => {
          this.$message.error('服务器繁忙！')
        })
      },

      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },

      detail (row) {
        router.push({name: 'stockInfo', params: {id: row.id}})
      },

      setInventory (row) {
        this.stock = row
        this.isModalOpen = true
      },

      search () {
        if (this.keywords) {
          this.$http.get('/v1/a/biz/code', {
            params: {
              c: this.keywords
            }
          }).then((res) => {
            if (res.body.errMessage) {
              this.$message({
                showClose: true,
                message: res.body.errMessage,
                type: 'error'
              })
            } else {
              console.log(res.body.data)
              this.info = res.body.data
              console.log(this.info)
              this.travelTicket = true
            }
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
          this.$http.post(`/v1/a/biz/code?c=${row.code}`).then(function (res) {
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
            this.$message({
              showClose: true,
              message: '服务器连接超时',
              type: 'error'
            })
          })
        })
      },

      handleChange () {
        if (this.stock.id && this.stock.stockNumber) {
          this.$http.post(`/v1/a/biz/stock?id=${this.stock.id}&s=${this.stock.stockNumber}`).then(function (res) {
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
              this.isModalOpen = false
            }
          }).catch(function (res) {
            this.$message({
              showClose: true,
              message: '服务器连接超时',
              type: 'error'
            })
          })
        }
      },
      addStockModalAction () {
        this.getProductTypeAndItem()
        this.addStockModal = true
      },
      getProductTypeAndItem () {
        if (this.productCombos.length === 0) {
          this.$http.get('/v1/a/biz/product').then(function (res) {
            if (res.body.errMessage) {
              this.$message({
                showClose: true,
                message: res.body.errMessage,
                type: 'error'
              })
            } else {
              this.productCombos = this.productCombos.concat(res.body.data)
            }
          })
        }
      },
      productComboSelected () {
        this.productCombo = this.productCombos[this.product.selectedProductIndex]
        this.product.productItemId = ''
      },
      addStock () {
        if (this.product.selectedProductIndex === null || this.product.selectedProductIndex === '') {
          this.$message({
            showClose: true,
            message: '请选择产品',
            type: 'error'
          })
          return
        }
        if (this.product.productItemId === null || this.product.productItemId === '') {
          this.$message({
            showClose: true,
            message: '请选择套餐',
            type: 'error'
          })
          return
        }
        if (this.product.s === null || this.product.s === '' || parseInt(this.product.s) === 0) {
          this.$message({
            showClose: true,
            message: '请设置库存',
            type: 'error'
          })
          return
        }
        console.log(this.product.s)
        if (this.product.dateAppointmentDate === undefined) {
          this.$message({
            showClose: true,
            message: '请设置预约时间',
            type: 'error'
          })
          return
        }
        var start = Date.parse(this.product.dateAppointmentDate[0])
        var end = Date.parse(this.product.dateAppointmentDate[1])
        var timestamp = end - start
        this.$http.post('/v1/a/biz/stock/add', {
          params: {
            s: this.product.s,
            productItemId: this.product.productItemId,
            day: timestamp,
            status: 0
          }
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
          }
        })
      },
      initAppointmentStartAndEndDate () {
        var start = new Date()
        var end = new Date()
        start.setTime(start.getTime() + 3600 * 1000 * 24)
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 7)
        this.product.dateAppointmentDate = [start, end]
      }
    },
    created () {
      this.getTableData()
      this.initAppointmentStartAndEndDate()
    }
  }
</script>
