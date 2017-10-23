<template>
  <div class="stockInfo">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>查询</el-breadcrumb-item>
        <el-breadcrumb-item>旅客情况</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">

      </div>
      <div class="r">

      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe max-height="500" @row-click="detail">
        <el-table-column prop="customerName" label="游客姓名"></el-table-column>
        <el-table-column prop="customerPhoneNumber" label="游客电话" min-width="200"></el-table-column>
        <el-table-column prop="bookingDate" label="预定时间" :formatter="timeDesc" min-width="150"></el-table-column>
        <el-table-column prop="completeDate" label="完成时间" :formatter="timeDesc" min-width="150"></el-table-column>
        <el-table-column prop="createDate" label="创建时间" :formatter="timeDesc" min-width="150"></el-table-column>
        <el-table-column prop="code" label="验证码"></el-table-column>
        <el-table-column prop="statusText" label="状态"></el-table-column>
        <el-table-column label="操作" min-width="110" fixed="right">
          <template scope="scope">
            <el-button type="text" @click.stop="detail(scope.row)">详情</el-button>
            <el-button type="text" @click.stop="del(scope.row)">核销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog v-model="isModalOpen" title="旅游票信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
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
        <el-button @click="isModalOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import moment from 'moment'

  export default {
    name: 'stockInfo',
    data () {
      return {
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
        tableData: null,
        keywords: '',
        loading: true,
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0,
        importLoading: false,
        isModalOpen: false
      }
    },
    computed: {},
    filters: {
      infoTimeFormatter (v) {
        return moment(v).format('YYYY-MM-DD HH:mm')
      }
    },
    methods: {
      getTableData () {
        this.loading = false
        this.$http.get('/v1/a/biz/booking/day?id=' + this.$route.params.id, {
          params: {
            pageSize: this.pageSize,
            order: this.sortType,
            pageIndex: this.currentPage,
            search: this.keywords,
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

      timeDesc (row, col) {
        return moment(row[col.property]).format('YYYY-MM-DD HH:mm')
      },

      detail (row) {
        this.info = row
        this.isModalOpen = true
      },

      del (row) {
        this.$confirm('确定核销吗？', '提示', {
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
