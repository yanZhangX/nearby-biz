<template>
  <div>
    <el-dialog :visible.sync="travelTicket" title="电子码信息" :close-on-click-modal="false" :show-close="false" close-on-press-escape >
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form ref="form" :model="info" label-width="140px" :inline-message="true" label-position="left">
            <el-form-item label="购买套餐名称：">
              <span style="color: red; font-size: 18px;">{{info.subTitle}}</span>
            </el-form-item>
            <el-form-item label="电子码及信息：">
              <span style="color: red; font-size: 18px;">{{info.code}}</span>
              <span style="color: black; font-size: 18px;">&ensp;&ensp;{{getUserName()}}</span>
              <span style="color: black; font-size: 18px;">&ensp;&ensp;{{getUserPhoneNumber()}}</span>
            </el-form-item>
            <el-form-item label="订单当前状态：">
              <span style="color: red; font-size: 18px;">{{info.statusText}}</span>
              <span style="color: red; font-size: 18px;">&ensp;&ensp;{{info.bookingDateText}}</span>
              <span style="color: red; font-size: 18px;">&ensp;&ensp;{{info.bookingItemText}}</span>
              <span v-if="info.bookingTips" style="color: red; font-size: 18px;">&ensp;&ensp;{{info.bookingTips}}</span>
            </el-form-item>
            <el-form-item label="选择核销型号：" v-if="info.booking === 1 && completeSettingModal">
              <el-radio-group v-model="bookingItemId" size="small">
                <el-radio  v-for="(item, index) in info.bookingItems" :label="item.id" :key="index">{{item.bookingItemText}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="选择到店时间：" v-if="completeSettingDate">
              <el-date-picker type="date"
                              :editable="false"
                              placeholder="请选择到店时间"
                              v-model="completeDay"
                              :clearable="false"></el-date-picker>
            </el-form-item>
            <el-form-item label="填写核销备注：">
              <span v-if="info.status === 1 || info.status === 2"><el-input v-model="info.completeMemo" size="small" placeholder="请您输入核销备注（非必填）" style="width: 70%;"></el-input></span>
              <span v-else>{{info.completeMemo}}</span>
            </el-form-item>
            <el-form-item label="下单备注信息：">
              {{info.memo || '无'}}
            </el-form-item>
            <el-form-item v-if="info.booking === 1 && info.status === 2" label="预约备注信息：">
              {{info.bookingMemo || '无'}}
            </el-form-item>
            <el-form-item label="客人下单时间：">
              {{info.createDate | infoTimeFormatter('yyyy-MM-dd hh:mm:ss')}}
            </el-form-item>
          </el-form>
        </div>

        <div class="complete-container" v-if="info.status === 3">
          <img src="/static/img/home/complete.png" alt="">
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="k-center">
          <el-button @click="closeDialog">关闭</el-button>
          <el-button type="primary" @click="del(info)" v-if="info.status === 1 || info.status === 2">核销</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import moment from 'moment'
  export default {
    name: 'commonConsume',
    props: ['code', 'type'],

    data () {
      return {
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
    created () {
      this.search(this.code)
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
              this.closeDialog()
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
            this.closeDialog()
            this.$message.error('服务器错误')
          })
        }
      },
      myDateFormat (date) {
        if (date) {
          return moment(date).format('YYYY年MM月DD日')
        } else {
          return ''
        }
      },
      del (row) {
        this.closeDialog()
        this.$confirm('确定核销吗？', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var memo = this.info.completeMemo
          if (this.paramIsNull(memo)) {
            memo = ''
          }
          var url = `/v1/a/biz/code?c=${row.code}&memo=${memo}&type=${this.type}`
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
              this.closeUpdate()
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
      },
      closeDialog () {
        this.$parent.onClickConsume(false, '')
      },
      closeUpdate () {
        this.$parent.onUpdate()
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
