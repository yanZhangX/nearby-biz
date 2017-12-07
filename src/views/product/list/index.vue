<template>
  <div class="staff-list">
    <div class="breadcrumb">
      <el-breadcrumb>
        <el-breadcrumb-item>产品信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">

    </div>
    <div class="main-container">
      <el-table :data="tableData" stripe max-height=2000>
        <el-table-column prop="name" label="产品" min-width="100">
          <template scope="scope">
            <el-tooltip placement="top-start">
              <div slot="content" class="tool-tip-content">{{scope.row.title}}</div>
              <span>{{scope.row.name}}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" :formatter="currency" label="抢购结束日期" min-width="100"></el-table-column>
        <el-table-column prop="codeTime"  :formatter="currency" label="发码日期" min-width="100"></el-table-column>
        <el-table-column prop="booking"  :formatter="isBooking" label="发码日期" min-width="100"></el-table-column>
        <el-table-column prop="bookingBeginDate"  :formatter="currency" label="预约日期" min-width="100"></el-table-column>
        <el-table-column prop="validBeginDate"  :formatter="currency" label="使用日期" min-width="100"></el-table-column>
        <el-table-column prop="validEndDate"  :formatter="currency" label="使用结束日期" min-width="100"></el-table-column>
        <el-table-column prop="productUrl" label="推广链接" min-width="100"></el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template scope="scope">
            <el-button type="text" @click.stop="detail(scope.row)">微信预览</el-button>
            <el-button type="text" @click.stop="editProduct(scope.row)">复制推广链接</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
                     layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :visible.sync="imagePreviewModal" fullscreen="true">
      <center>
        <img :src="imageUrl" style="width: 300px;height: 300px;"/>
        <div style="margin-top: 30px;">请使用微信扫描二维码预览</div>
      </center>
    </el-dialog>
  </div>
</template>

<script>

  import moment from 'moment'

  export default {
    name: 'checkOrder',
    data () {
      return {
        tableData: null,
        keywords: '',
        currentPage: 1,
        pageSize: 20,
        total: null,
        pageCount: 0,
        imagePreviewModal: false,
        imageUrl: null
      }
    },
    created () {
      this.getTableData()
    },
    methods: {
      getTableData () {
        this.$http.get('/v1/a/biz/channel/product/list', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage,
            date: this.timeStamp
          }
        }).then(res => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
          }
        }).catch(res => {
          this.$message.error('服务器繁忙！')
        })
      },
      detail (row) {
        this.imagePreviewModal = true
        var url = encodeURI(row.productUrl)
        this.$http.get('/v2/nearby/qrcode', {
          params: {
            url: url
          }
        }).then(res => {
          this.imageUrl = res.body.data
        }).catch(e => {
          this.$message.error('服务器错误')
        })
      },
      editProduct (row) {
        window.clipboardData.setData('Url', row.productUrl)
        this.$message.success('复制推广链接成功')
      },
      search () {
        this.currentPage = 1
        this.getTableData()
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      isBooking (row, coolum, val) {
        return val === 1 ? '接受预约' : '不接受预约'
      },
      currency (row, column, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD')
        } else {
          return ''
        }
      }
    }
  }
</script>
