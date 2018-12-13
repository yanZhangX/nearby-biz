<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>快递信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="l">
        <div class="k-search-contaienr">
          <el-select v-model="type" placeholder="发货状态" @change="search">
            <el-option v-for="item in typeList" :key="item.type" :label="item.title" :value="item.type">
            </el-option>
          </el-select>
        </div>
      </div>

      <div class="r">
        <el-button class="uploader" type="primary" @click="exportOrder">导出订单</el-button>
        <el-button type="primary" @click="downloadExcelModel">下载物流模版</el-button>
        <el-button type="primary" @click="openDeliveryModal">导入物流信息</el-button>
        <el-button class="uploader" type="primary" @click="sendExpressMsgSms">发送物流信息短信</el-button>
      </div>
    </div>
    <div class="main-container">
      <div style="color: red" ref="importExcelMessage"></div>
      <el-table :data="tableData" :highlight-current-row="true" v-loading.body="loading" stripe scope="scope" max-height=2000>
        <el-table-column prop="customerName" label="顾客姓名" min-width="85"></el-table-column>
        <el-table-column prop="customerPhoneNumber" label="顾客手机号" min-width="115"></el-table-column>
        <el-table-column prop="address" label="邮寄地址" min-width="160"></el-table-column>
        <el-table-column prop="memo" label="备注" min-width="120"></el-table-column>
        <el-table-column prop="expressName" label="快递公司" min-width="120" v-if="type!==1"></el-table-column>
        <el-table-column prop="expressInfo" label="快递单号" min-width="140" v-if="type!==1">
          <template slot-scope="scope">
            <span style="color: red">{{scope.row.expressInfo}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderId" label="订单号" min-width="130"></el-table-column>
        <el-table-column prop="sendSmsStr" label="发短信" min-width="80"></el-table-column>
        <el-table-column prop="name" label="产品名称" min-width="100"></el-table-column>
        <el-table-column prop="subTitle" label="套餐" min-width="100"></el-table-column>
        <el-table-column label="操作" min-width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="inputDeliveryNumber(scope.row)" v-if="paramIsNull(scope.row.expressInfo)">录入快递信息</el-button>
            <el-button type="text" @click="inputDeliveryNumber(scope.row)" v-else>修改快递信息</el-button>
            <el-button type="text" @click="onSearchDelovery(scope.row)" v-if="!paramIsNull(scope.row.expressInfo)">查询物流信息</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="k-center" v-show="total>1">
      <el-pagination @current-change="pageIndexChange" :current-page="currentPage" :page-size="pageSize"
                     layout="total, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :visible.sync="inputDeliveryNumberModal" title="快递信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape >
      <div class="modal-info-container">
        <div class="info-content-container">
          <ul>
            <li>
              <el-select v-model="deliveryName" placeholder="请输入快递公司" style="width: 100%">
                <el-option v-for="(item, index) in deliveryList" :key="index" :label="item.name" :value="item.name"></el-option>
              </el-select>
            </li>
          </ul>
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
    <el-dialog :visible.sync="showImportExcelModal" title="请选择物流公司" width="440px">
      <el-select v-model="selectedDelivery" style="width: 100%" placeholder="请选择物流公司">
        <el-option v-for="(item, index) in deliveryList" :key="index" :label="item.name" :value="item.id"></el-option>
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportExcelModal = false">取消导入</el-button>
        <el-upload style="display: inline-block; margin-left: 10px;"
                   action="form.action"
                   :multiple="false"
                   :auto-upload="false"
                   accept=".xls,.xlsx"
                   :on-change="fileListChange"
                   v-if="selectedDelivery"
                   :show-file-list="false">
          <el-button type="primary">导入物流信息</el-button>
        </el-upload>
        <el-button type="primary" disabled v-else>请先选择物流公司</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="showDeliveryDetail" title="物流详情">
      <div v-if="deliveryInfo.length === 0">暂无物流信息，请稍后再试！</div>
      <el-steps direction="vertical" :active="1" space="100px" v-else>
        <el-step v-for="(item, index) in deliveryInfo" :key="index" :title="item.acceptTime" :description="item.acceptStation"></el-step>
      </el-steps>
    </el-dialog>
  </div>
</template>

<script>
  // const DELIVERY_HOST = 'http://192.168.11.219:8080'
  const DELIVERY_HOST = 'http://callback.lianlianlvyou.com'
  const API_GET_DELIVERY = DELIVERY_HOST + '/express/types'
  const API_GET_DELIERY_DETAIL = DELIVERY_HOST + '/express/query'
  import moment from 'moment'
  import {appHost, getToken} from 'CONST'
  export default {
    data () {
      return {
        showImportExcelModal: false, // 显示导入弹窗
        deliveryList: [],
        selectedDelivery: null,
        tableData: [],
        showDeliveryDetail: false,
        deliveryInfo: [],
        keywords: '',
        loading: false,
        currentPage: 1,
        pageSize: 15,
        total: null,
        inputDeliveryNumberModal: false,
        row: null,
        deliveryName: null,
        deliveryNumber: null,
        importExcelFile: null,
        importExcelMessage: null,
        type: 1,
        typeList: [
          {
            type: 0,
            title: '全部订单'
          },
          {
            type: 1,
            title: '未发货订单'
          },
          {
            type: 2,
            title: '已发货订单'
          }
        ]
      }
    },
    computed: {},
    methods: {
      sendExpressMsgSms () {
        this.$msgbox({
          title: '温馨提示',
          message: this.$createElement('p', null, [
            this.$createElement('span', null, '确认要给「已有物流信息」并且「未发送过短信」的用户发送物流信息短信?')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认发送',
          cancelButtonText: '再考虑一下',
          type: 'warning',
          center: true
        }).then(() => {
          var loading = this.$loading({
            lock: true,
            text: '物流信息短信发送中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.post('/v1/a/biz/order/express/send').then(res => {
            loading.close()
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success('短信发送成功')
            }
          }).catch(res => {
            loading.close()
            this.$message.error('服务器繁忙！')
          })
        })
      },
      trim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, '')
      },
      onSearchDelovery (row) {
        this.row = JSON.parse(JSON.stringify(row))
        let expressNo = row.expressInfo
        if (!expressNo) return this.$message.error('数据错误')
        let typeName = row.expressName || ''
        this.$emit('loading', true, '正在查询物流信息。。。')
        this.$http.get(API_GET_DELIERY_DETAIL, {
          params: {
            expressNo,
            typeName
          }
        }).then(res => {
          this.$emit('loading')
          if (res.body.errMessage) return this.$message.error(res.body.errMessage)
          let data = res.body.data || {}
          let traces = data.traces || []
          this.deliveryInfo = traces
          // console.log(traces)
          // this.deliveryInfo = []
          this.showDeliveryDetail = true
        }).catch(e => {
          this.$emit('loading')
          this.$message.error('服务器繁忙')
        })
      },
      openDeliveryModal () {
        this.getDeliveryList().then(() => {
          this.showImportExcelModal = true
          this.selectedDelivery = null
        }).catch(e => {
          this.$message.error('获取物流公司信息失败：' + e)
        })
      },
      getDeliveryList () {
        return new Promise((resolve, reject) => {
          if (this.deliveryList && this.deliveryList.length > 0) {
            return resolve()
          }
          this.$http.get(API_GET_DELIVERY).then(res => {
            if (res.body.errMessage) return reject(res.body.errMessage)
            this.deliveryList = res.body.data || []
            resolve()
          }).catch(e => {
            reject('服务器繁忙')
          })
        })
      },
      dateFormat (row) {
        if (row.completeDate) {
          return moment(row.completeDate).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/a/biz/user/order/express/list', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage,
            type: this.type
          }
        }).then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
          }
        }).catch(res => {
          loading.close()
          this.$message.error('服务器繁忙！')
        })
      },
      pageIndexChange (val) {
        this.currentPage = val
        this.getTableData()
      },
      search () {
        this.currentPage = 1
        this.getTableData()
      },
      inputDeliveryNumber (row) {
        this.getDeliveryList().then(() => {
          this.row = row
          this.deliveryName = null
          this.deliveryNumber = null
          this.inputDeliveryNumberModal = true
        }).catch(e => {
          this.$message.error('获取物流公司信息失败：' + e)
        })
      },
      completeInput () {
        if (this.paramIsNull(this.deliveryName)) {
          this.$message.error('快递公司不能为空')
          return
        }
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
            h('div', {style: 'color: red;'}, `快递公司：${this.deliveryName}`),
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
            expressName: this.deliveryName,
            expressInfo: this.deliveryNumber
          }).then((res) => {
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success('录入快递单号成功')
              this.getTableData()
            }
          }).catch(e => {
            this.inputDeliveryNumberModal = true
            this.$message.error('服务器错误')
          })
        }).catch(() => {
          this.inputDeliveryNumberModal = true
        })
      },
      fileListChange (file, fileList) {
        this.$refs.importExcelMessage.innerHTML = null
        let delivery = this.deliveryList.find(e => e.id === this.selectedDelivery) || {}
        let deliveryName = delivery.name || ''
        this.importExcelFile = file
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('div', null, '导入物流信息确认：'),
            h('div', {style: 'color: red;'}, `导入表格：${this.importExcelFile.raw.name}`),
            h('div', {style: 'color: red;'}, `导入物流公司：${deliveryName}`)
          ]),
          showCancelButton: true,
          confirmButtonText: '确认无误并导入',
          cancelButtonText: '再检查一下',
          type: 'warning',
          center: true
        }).then(() => {
          var formData = new FormData()
          formData.append('file', this.importExcelFile.raw)
          var loading = this.$loading({
            lock: true,
            text: '物流信息导入中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.post('/v1/a/biz/order/import/expressinfo/excel?name=' + deliveryName, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(res => {
            loading.close()
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$refs.importExcelMessage.innerHTML = res.body.data
            }
            this.currentPage = 1
            this.getTableData()
          }).catch(res => {
            loading.close()
            this.$message.error('服务器繁忙！')
          }).then(() => {
            this.showImportExcelModal = false
          })
        })
      },
      downloadExcelModel () {
        window.open('https://cdn.lianlianlvyou.com/excel/%E5%AF%BC%E5%85%A5%E8%BF%90%E5%8D%95%E6%A8%A1%E7%89%88.xls')
      },
      exportOrder () {
        if (this.paramIsNull(this.tableData)) {
          this.pro_message_error(null, '暂无订单信息可以导出')
          return
        }
        this.downloadUrl = `${appHost()}/v1/a/order/list/download?token=${getToken()}&type=${this.type}`
        window.open(this.downloadUrl)
      }
    },
    created () {
      this.getTableData()
    }
  }
</script>
