<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>快递信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">

    </div>
    <div class="main-container">
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe scope="scope" max-height=2000>
        <el-table-column prop="customerName" label="顾客姓名"></el-table-column>
        <el-table-column prop="customerPhoneNumber" label="顾客手机号"></el-table-column>
        <el-table-column prop="orderId" label="订单号"></el-table-column>
        <el-table-column prop="code" label="电子码"></el-table-column>
        <el-table-column prop="name" label="产品名称" min-width="200"></el-table-column>
        <el-table-column prop="subTitle" label="套餐" min-width="100"></el-table-column>
        <el-table-column prop="expressInfo" label="快递单号" min-width="140"></el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <templete slot-scope="scope">
            <el-button type="text" @click="inputDeliveryNumber(scope.row)" v-if="paramIsNull(scope.row.expressInfo)">新增快递单号</el-button>
            <el-button type="text" @click="inputDeliveryNumber(scope.row)" v-else>修改快递单号</el-button>
          </templete>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="pageCount>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
                     layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog v-model="inputDeliveryNumberModal" title="快递单号信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape >
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <li><el-input v-model="deliveryNumber" placeholder="请输入快递单号"></el-input></li>
          </ul>
        </div>

      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="inputDeliveryNumberModal = false">关闭</el-button>
          <el-button type="primary" @click="completeInput">完成</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import moment from 'moment'
  export default {
    data () {
      return {
        tableData: null,
        keywords: '',
        loading: false,
        currentPage: 1,
        pageSize: 15,
        total: null,
        inputDeliveryNumberModal: false,
        row: null,
        deliveryNumber: null
      }
    },
    computed: {},
    methods: {
      trim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, '')
      },
      paramIsNull (param) {
        if (typeof (param) === 'undefined' || param === null) {
          return true
        } else if (typeof (param) === 'string') {
          if (param.replace(/(^\s*)|(\s*$)/g, '').length === 0) {
            return true
          } else {
            return false
          }
        }
        return false
      },
      dateFormat (row) {
        if (row.completeDate) {
          return moment(row.completeDate).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      getTableData () {
        this.$http.get('/v1/a/biz/user/order/express/list', {
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
          }
        }).catch(res => {
          this.$message.error('服务器繁忙！')
        })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      inputDeliveryNumber (row) {
        this.row = row
        this.deliveryNumber = null
        this.inputDeliveryNumberModal = true
      },
      completeInput () {
        if (this.paramIsNull(this.deliveryNumber)) {
          this.$message.error('快递单号不能为空')
          return
        }
        this.inputDeliveryNumberModal = false
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('div', null, '快递单号信息确认：'),
            h('div', {style: 'color: red;'}, `产品：${this.row.name}`),
            h('div', {style: 'color: red;'}, `套餐：${this.row.subTitle}`),
            h('div', {style: 'color: red;'}, `顾客姓名：${this.row.customerName}`),
            h('div', {style: 'color: red;'}, `顾客手机：${this.row.customerPhoneNumber}`),
            h('div', {style: 'color: red;'}, `订单号：${this.row.orderId}`),
            h('div', {style: 'color: red;'}, `快递单号：${this.deliveryNumber}`)
          ]),
          showCancelButton: true,
          confirmButtonText: '确认',
          cancelButtonText: '再检查一下',
          type: 'warning',
          center: true
        }).then(() => {
          this.$http.post('/v1/a/biz/user/order/express/add', {
            orderId: this.row.orderId,
            expressInfo: this.deliveryNumber
          }).then((res) => {
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success('新增快递单号成功')
              this.getTableData()
            }
          }).catch(e => {
            this.inputDeliveryNumberModal = true
            this.$message.error('服务器错误')
          })
        }).catch(() => {
          this.inputDeliveryNumberModal = true
        })
      }
    },
    created () {
      this.getTableData()
    }
  }
</script>
