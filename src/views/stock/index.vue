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
          <input type="text" placeholder="搜索关键词" class="k-search-input" v-model="keywords" @keyup.enter="search">
        </div>
      </div>
      <div class="r">

      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe scope="scope" max-height="500">
        <el-table-column prop="bookingDay" label="预定时间"></el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="200"></el-table-column>
        <el-table-column prop="productItemName" label="套餐" min-width="100"></el-table-column>
        <el-table-column prop="stockNumber" label="库存数量"></el-table-column>
        <el-table-column prop="bookingNumber" label="预定数量"></el-table-column>
        <el-table-column prop="completeNumber" label="完成数量"></el-table-column>
        <el-table-column label="操作" min-width="110" fixed="right">
          <template scope="scope">
            <el-button type="text" @click.stop="detail(scope.row)">旅游情况</el-button>
            <el-button type="text" @click.stop="setInventory(scope.row)">设置库存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
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

    <el-dialog v-model="travelTicket" title="旅游票信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <li><span>游客姓名：</span><span>{{info.customerName}}</span></li>
            <li><span>游客电话：</span><span>{{info.customerPhoneNumber}}</span></li>
            <li><span>预定时间：</span><span>{{info.bookingDate | infoTimeFormatter}}</span></li>
            <li><span>完成时间：</span><span>{{info.completeDate | infoTimeFormatter}}</span></li>
            <li><span>创建时间：</span><span>{{info.createDate | infoTimeFormatter}}</span></li>
            <li><span>验证码：</span><span>{{info.code}}</span></li>
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
  </div>
</template>

<script>
  import router from 'ROUTE'
  export default {
    name: 'stock',
    data () {
      return {
        stock: {
          id: '',
          stockNumber: ''
        },
        tableData: null,
        keywords: '',
        loading: true,
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0,
        importLoading: false,
        isModalOpen: false,
        travelTicket: false,
        info: {
          customerName: '',
          customerPhoneNumber: '',
          status: '',
          bookingDate: '',
          completeDate: '',
          createDate: '',
          code: '',
          statusText: ''
        }
      }
    },
    computed: {},
    methods: {
      getTableData () {
        this.loading = false
        this.$http.get('/v1/a/biz/booking', {
          params: {
            pageSize: this.pageSize,
            order: this.sortType,
            pageIndex: this.currentPage,
            status: this.state
          }
        }).then(res => {
          this.loading = false
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
          }
        }).catch(res => {
          this.loading = false
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
      }
    },
    created () {
      this.getTableData()
    }
  }
</script>
