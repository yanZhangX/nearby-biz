<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>预约确定列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <el-select style="width: 270px" v-model="groupProductIndex" placeholder="请选择产品" @change="groupProductChanged">
          <el-option v-for="(item, index) in groupProductList" :label="item.name" :key="index" :value="index"></el-option>
        </el-select>
        <el-select v-model="type" placeholder="请选择类型" @change="bookingTypeChanged">
          <el-option v-for="item in bookingTypeList" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </div>
    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" stripe scope="scope" max-height=2000>
        <el-table-column prop="bookingCustomerName" label="客户姓名" min-width="100" :formatter="bookingCustomerNameFormat"></el-table-column>
        <el-table-column prop="bookingCustomerPhoneNumber" label="客户手机" min-width="150" :formatter="bookingCustomerPhoneNumberFormat"></el-table-column>
        <el-table-column prop="bookingDay" label="预约时间" min-width="100" :formatter="bookingDay"></el-table-column>
        <el-table-column prop="bookingItemText" label="预约类型" min-width="100"></el-table-column>
        <el-table-column prop="memo" label="预约备注" min-width="100"></el-table-column>
        <el-table-column prop="createDate" label="确定时间" min-width="160">
          <template slot-scope="scope">
            <span v-html="pro_yyyyMMDD(null, null, scope.row.createDate)" v-if="!paramIsNull(scope.row.sure) && scope.row.sure === 1"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="confirmBookingItem(scope.row)" v-if="!paramIsNull(scope.row.sure) && scope.row.sure === 0">预约确认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
                     layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  export default {
    data () {
      return {
        tableData: null,
        currentPage: 1,
        pageSize: 15,
        total: null,
        pageCount: 0,
        type: null,
        bookingTypeList: [
          {
            id: 1,
            name: '未确认'
          },
          {
            id: 0,
            name: '已确认'
          }
        ],
        groupProductList: null,
        groupProductIndex: null,
        groupProduct: {
          productGroupId: null,
          name: null
        }
      }
    },
    created () {
      this.type = 1
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
      bookingCustomerNameFormat (row, col, val) {
        if (row.bookingCustomerName) {
          return row.bookingCustomerName
        } else {
          return row.customerName
        }
      },
      bookingCustomerPhoneNumberFormat (row, col, val) {
        if (row.bookingCustomerPhoneNumber) {
          return row.bookingCustomerPhoneNumber
        } else {
          return row.customerPhoneNumber
        }
      },
      bookingDay (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD')
        } else {
          return ''
        }
      },
      createDate (row, col, val) {
        if (val) {
          return moment(val).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      getTableData () {
        this.$http.get(`/v1/a/biz/order/sure/list?type=${this.type}`, {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage,
            productGroupId: this.groupProduct.productGroupId
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
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      confirmBookingItem (row) {
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认已经知晓用户（'),
            h('span', {style: 'color: red;'}, `${this.bookingCustomerNameFormat(row, null, null)}：${this.bookingCustomerPhoneNumberFormat(row, null, null)}`),
            h('span', null, '）的预约信息了吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.$http.post(`/v1/a/biz/order/sure?orderId=${row.orderId}`).then(res => {
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success('确认操作成功')
              this.getTableData()
            }
          }).catch(e => {
            this.$message.error('服务器错误')
          })
        })
      },
      bookingTypeChanged () {
        this.currentPage = 1
        this.getTableData()
      }
    }
  }
</script>
