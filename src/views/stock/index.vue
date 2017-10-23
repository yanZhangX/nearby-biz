<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>查询</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">

      </div>
      <div class="r">

      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe scope="scope" max-height="500" @row-click="detail">
        <el-table-column prop="bookingDay" label="预定时间"></el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="200"></el-table-column>
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
        isModalOpen: false
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

      detail (row) {
        router.push({name: 'stockInfo', params: {id: row.id}})
      },

      setInventory (row) {
        this.stock = row
        this.isModalOpen = true
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
