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
  </div>
</template>

<script>
  import moment from 'moment'
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
              this.info = res.body.data
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
      }
    },
    created () {
      this.getTableData()
    }
  }
</script>
