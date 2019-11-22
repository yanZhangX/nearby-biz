<template>
  <div class="dataStatistics">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>销量统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="r right-view">
        <div class="total-number" style="padding-right: 20px;">{{totalSaleAmount}}</div>
        <!-- <el-button type="primary" class="export-btn" @click="exportExcelData">导出数据</el-button> -->
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" v-loading.body="loading" stripe scope="scope" max-height=2000>
        <el-table-column prop="name" label="店铺"></el-table-column>
        <template v-for="(datas, index) in productList">
          <el-table-column v-if="productList" :prop="'product'+index" :label="datas" :key="index"></el-table-column>
        </template>
        <el-table-column prop="saleAmount" label="总销量"></el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>0">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
                     layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        tableData: null,
        loading: false,
        currentPage: 1,
        pageSize: 10,
        total: null,
        rowCount: 0,
        pageCount: 0,
        totalSaleAmount: 0,
        optionLoading: false,
        productList: []
      }
    },
    created () {
      this.getTableData()
    },
    methods: {
      getProductList () {
        return new Promise((resolve, reject) => {
          this.$http.get('/v1/a/biz/product/name', {params: {}})
            .then(res => {
              if (res) {
                this.productList = res.body.data || []
                resolve()
              } else {
                reject()
              }
            })
            .catch(e => {
              reject()
            })
        })
      },
      dataItemChanged () {
        this.currentPage = 1
        this.getTableData()
      },
      paramIsNull (param) {
        if (typeof (param) === 'undefined' || param === null) {
          return true
        }
        return false
      },
      allParams () {
        return {
          pageSize: this.pageSize,
          pageIndex: this.currentPage
        }
      },
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.getProductList()
          .then(() => {
            return this.$http.get('/v1/a/biz/product/saleAmount/statistics', {
              params: this.allParams()
            })
          }).then(res => {
            loading.close()
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.tableData = res.body.data.pagingData.data
              this.tableData.forEach((item) => {
                this.productList.forEach((list, index) => {
                  let productName = 'product' + index
                  item[productName] = null
                  item.child.forEach((num) => {
                    if (num.name === list) {
                      item[productName] = num.clearVolume
                    }
                  })
                })
              })
              this.tableData.forEach((item2) => {
                this.productList.forEach((list, index) => {
                  let productName = 'product' + index
                  if (item2[productName] === null) {
                    item2[productName] = '无'
                  }
                })
              })
              this.totalSaleAmount = res.body.data.totalSaleAmount
              this.total = res.body.data.pagingData.rowCount
              this.pageCount = res.body.data.pagingData.pageCount
            }
          }).catch(res => {
            loading.close()
            this.$message.error('服务器繁忙！')
          })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      }
    }
  }
</script>


<style lang="scss" scoped>
.total-number{
    color: #333;
}
.right-view{
    display: flex;
    align-items: center;
}
.export-btn{
    color: #fff;
    margin-left: 10px;
}
</style>
