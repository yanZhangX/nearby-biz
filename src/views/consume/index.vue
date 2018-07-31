<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>核销功能</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div v-for="(item, index) in tableData">
      <div class="code-search-contaienr">
        <input type="text" placeholder="请输入电子码" class="code-search-input" v-model="item.keywords" @keyup.enter="search(item.keywords)">
        <el-button class="code-search-btn" @click="search(item.keywords)">查询核销</el-button>
      </div>
    </div>
    <button class="clearcode-search-btn" @click="clear">清空</button>
    <el-dialog :visible.sync="travelTicket" title="电子码信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape >
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form ref="form" :model="info" label-width="140px" :inline-message="true" label-position="left">
            <el-form-item label="套餐内容：">
              {{info.subTitle}}
            </el-form-item>
            <el-form-item label="下单时间：">
              {{info.createDate | infoTimeFormatter('yyyy-MM-dd hh:mm:ss')}}
            </el-form-item>
            <el-form-item label="电子码：">
              <span>{{info.code}}</span>
              <span>{{getUserName()}}</span>
              <span>{{getUserPhoneNumber()}}</span>
            </el-form-item>
            <el-form-item label="状态：">
              <span>{{info.statusText}}</span>
              <span>{{info.bookingDateText}}</span>
              <span>{{info.bookingItemText}}</span>
            </el-form-item>
            <el-form-item label="产品型号选择：" v-if="completeSettingModal">
              <el-radio-group v-model="bookingItemId" size="small">
                <el-radio  v-for="(item, index) in info.bookingItems" :label="item.id" :key="index">{{item.bookingItemText}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="到店时间选择：" v-if="completeSettingDate">
              <el-date-picker type="date"
                              :editable="false"
                              placeholder="请选择到店时间"
                              v-model="completeDay"
                              :clearable="false"></el-date-picker>
            </el-form-item>
            <el-form-item label="订单备注：">
              {{info.memo}}
            </el-form-item>
            <el-form-item label="预约备注：">
              {{info.bookingMemo}}
            </el-form-item>
            <el-form-item label="核销备注：">
              <span v-if="info.status === 1 || info.status === 2"><el-input v-model="info.completeMemo" size="small" placeholder="请输入核销备注" style="width: 70%;"></el-input></span>
              <span v-else>{{info.completeMemo}}</span>
            </el-form-item>
          </el-form>
        </div>

        <div class="complete-container" v-if="info.status === 3">
          <img src="/static/img/home/complete.png" alt="">
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
    name: 'consume',
    data () {
      return {
        tableData: [
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          },
          {
            keywords: ''
          }
        ],
        loading: false,
        travelTicket: false,
        completeSettingModal: false,
        completeSettingDate: false,
        bookingItemId: null,
        completeDay: null,
        info: {
          customerName: '',
          customerPhoneNumber: '',
          bookingCustomerName: '',
          bookingCustomerPhoneNumber: '',
          status: 0,
          bookingDate: '',
          bookingDateText: '',
          completeDate: '',
          createDate: '',
          code: '',
          statusText: '',
          bookingMemo: '',
          bookingItemText: '',
          bookingItems: [],
          completeMemo: null
        }
      }
    },
    computed: {},
    created () {
    },
    methods: {
      getUserName () {
        var reg = /^(.).*$/
        if (!this.paramIsNull(this.info.bookingCustomerName)) {
          return this.info.bookingCustomerName.replace(reg, '$1**')
        } else if (!this.paramIsNull(this.info.customerName)) {
          return this.info.customerName.replace(reg, '$1**')
        }
        return ''
      },
      getUserPhoneNumber () {
        var reg = /(\d{3})\d{4}(\d{4})/
        if (!this.paramIsNull(this.info.bookingCustomerPhoneNumber)) {
          return this.info.bookingCustomerPhoneNumber.replace(reg, '$1****$2')
        } else if (!this.paramIsNull(this.info.customerPhoneNumber)) {
          return this.info.customerPhoneNumber.replace(reg, '$1****$2')
        }
        return ''
      },
      dateFormat (row) {
        if (row.completeDate) {
          return moment(row.completeDate).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      },
      myDateFormat (date) {
        if (date) {
          return moment(date).format('YYYY-MM-DD')
        } else {
          return ''
        }
      },
      clear () {
        var have = false
        for (var i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].keywords) {
            have = true
            break
          }
        }
        if (!have) {
          this.$message.warning('没有要清空的数据')
          return
        }
        var h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('span', null, '确认要清空所有已输入的电子码？'),
          showCancelButton: true,
          confirmButtonText: '确认清空',
          cancelButtonText: '再考虑一下',
          type: 'warning',
          center: true
        }).then(() => {
          for (var i = 0; i < this.tableData.length; i++) {
            this.tableData[i].keywords = ''
          }
          this.$message.success('输入的所有电子码已清空')
        }).catch(e => {
          this.selectDateModal = true
        })
      },
      search (keywords) {
        if (keywords) {
          var loading = this.$loading({
            lock: true,
            text: '查询中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.get('/v1/a/biz/code', {
            params: {
              c: keywords
            }
          }).then((res) => {
            loading.close()
            if (res.body.errMessage) {
              this.$message({
                showClose: true,
                message: res.body.errMessage,
                type: 'error'
              })
            } else {
              this.completeDay = new Date()
              this.info = res.body.data
              this.info.bookingDateText = this.myDateFormat(this.info.bookingDay)
              this.travelTicket = true
              if (typeof (this.info.bookingItems) !== 'undefined' && this.info.bookingItems !== null && this.info.bookingItems.length > 0) {
                this.bookingItemId = this.info.bookingItems[0].id
                this.completeSettingModal = true
              } else {
                this.completeSettingModal = false
              }
            }
          }).catch(e => {
            loading.close()
            this.$message.error('服务器错误')
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
          var memo = this.info.completeMemo
          if (this.paramIsNull(memo)) {
            memo = ''
          }
          var url = `/v1/a/biz/code?c=${row.code}&memo=${memo}`
          if (this.info.status === 1 && this.info.booking === 1) {
            url = `/v1/a/biz/code?c=${row.code}&memo=${memo}&bookingItemId=${this.bookingItemId}&bookingDay=${this.completeDay.getTime()}`
          }
          var loading = this.$loading({
            lock: true,
            text: '核销中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.post(url).then(function (res) {
            loading.close()
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
            }
          }).catch(function (res) {
            loading.close()
            this.$message({
              showClose: true,
              message: '服务器连接超时',
              type: 'error'
            })
          })
        })
      }
    }
  }
</script>
