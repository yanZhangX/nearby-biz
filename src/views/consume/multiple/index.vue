<template>
  <div class="content">
    <div class="weui-cell">
      <div class="code-search-contaienr" style="height: 45px;">
        <input v-model="code" class="code-search-input" style="height: 45px; width: 610px !important;" placeholder="请输入电子码核销">
      </div>
      <div class="weui-cell__ft" style="margin-top: 20px; margin-left: 20px;">
        <a href="javascript:;" class="weui-vcode-btn right-status-button" @click="search()">查询核销</a>
      </div>
    </div>

    <div class="content-container" style="margin-bottom: 200px;">
      <div class="weui-cell" style="width: 765px; margin-left: 20px;" v-if="this.tableData">
        <div style="width: 600px; padding-left: 2px;">
          <div v-html="'套餐：' + subTitle + '<br>姓名：' + userName + '&emsp;&emsp;&emsp;手机号：' + phoneNumber"></div>
        </div>
        <div class="weui-cell" style="margin-left: 50px;">
          <div class="weui-cell__ft" style="" v-if="inBatchMode">
            <a href="javascript:" @click="onCancleBatch" class="weui-vcode-btn right-status-button">取消</a>
          </div>
          <div class="weui-cell__ft" v-if="numOfValidCode > 1 && !inBatchMode">
            <a href="javascript:" @click="onOpenBathchModal" class="weui-vcode-btn right-status-button-sure">批量核销</a>
          </div>
          <div class="weui-cell__ft" style="margin-left: 10px;" v-if="inBatchMode && selectedCode.length !== 0">
            <a href="javascript:" @click="onConfirmBatch" class="weui-vcode-btn right-status-button-sure">确认核销</a>
          </div>
        </div>
      </div>
      <p v-if="this.tableData" class="info-batch-tips" style="width: 734px; margin-left: 36px; background: #dfdfdf; color: #eb0503;">
        {{inBatchMode ? ('已选' + selectedCode.length + '/' + numOfValidCode) : (numOfValidCode + '个电子码可核销')}}</p>
      <div class="weui-cells" style="margin-left: 36px; margin-top: 0px; width: 764px;" v-for="(row, index) in tableData" :key="index">
        <div class="weui-cell" style="padding: 0;">
          <div class="weui-cell" style="width: 680px; height: 75px; padding: 0 15px;" @click="onCodeClick(row)">
            <div>
              <i class="weui-icon-success-no-circle" v-if="row.selected"></i>
              <span v-html="row.code"></span>
              <div class="complete_date_text" v-if="row.status === 3">完成时间：{{row.completeDateStr}}</div>
            </div>
          </div>
          <div class="weui-cell__ft" style="padding: 10px 15px;">
            <div class="weui-cell__ft" v-if="row.status === 3">
              <span class="weui-vcode-btn right-status-button-other" v-html="row.statusText"></span>
            </div>
            <div class="weui-cell__ft" v-else-if="inBatchMode">
              <a href="javascript:;" class="weui-vcode-btn right-status-button disable">核销</a>
            </div>
            <div class="weui-cell__ft" v-else>
              <a href="javascript:;" class="weui-vcode-btn right-status-button" @click="bizCodeComplete(row)">核销</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isError">
      <div class="weui-mask"></div>
      <div class="weui-dialog">
        <div class="weui-dialog__hd"><strong class="weui-dialog__title">提示</strong></div>
        <div class="weui-dialog__bd">
          {{message}}
        </div>
        <div class="weui-dialog__ft">
          <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="close">关闭</a>
        </div>
      </div>
    </div>

    <div v-if="searchCompleteModal">
      <div class="weui-mask"></div>
      <div class="weui-dialog">
        <div class="weui-dialog__hd"><strong class="weui-dialog__title">核销提示</strong></div>
        <div class="weui-cell">
          <div class="weui-cell__hd">
            <label class="weui-label">套餐</label>
          </div>
          <div class="weui-cell__bd">
            {{this.bizOder.subTitle}}
          </div>
        </div>
        <div class="weui-cell">
          <div class="weui-cell__hd">
            <label class="weui-label">姓名</label>
          </div>
          <div class="weui-cell__bd">
            {{this.pro_getUserName(this.bizOder.customerName, this.bizOder.bookingCustomerName)}}
          </div>
        </div>
        <div class="weui-cell">
          <div class="weui-cell__hd">
            <label class="weui-label">手机号</label>
          </div>
          <div class="weui-cell__bd">
            {{this.pro_getUserPhoneNumber(this.bizOder.customerPhoneNumber, this.bizOder.bookingCustomerPhoneNumber)}}
          </div>
        </div>
        <div class="weui-cell">
          <div class="weui-cell__hd">
            <label class="weui-label">电子码</label>
          </div>
          <div class="weui-cell__bd">
            {{this.bizOder.code}}
          </div>
        </div>
        <div class="weui-dialog__ft">
          <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="cancleSearchCompleteModal">关闭</a>
          <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="completeCode">确认核销</a>
        </div>
      </div>
    </div>
    <div v-if="showBatchModal">
      <div class="weui-mask"></div>
      <div class="weui-dialog">
        <div class="weui-dialog__hd">请输入核销数量</div>
        <div class="weui-dialog__bd">
          <div class="weui-flex bactch-input">
            <div class="weui-flex__item" style="flex-grow:1">
              <a href="javascript:" class="batch-number-oprate sub" @click="batchNumSub">-</a>
            </div>
            <div class="weui-flex__item" style="flex-grow:2">
              <input id="batch-number" type="number" v-model.number="batchCodeNum" />
            </div>
            <div class="weui-flex__item" style="flex-grow:1">
              <a href="javascript:" class="batch-number-oprate add" @click="batchNumAdd">+</a>
            </div>
          </div>
        </div>
        <div class="weui-dialog__ft">
          <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" @click="showBatchModal = false">取消</a>
          <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="onOpenBatchMode">确定</a>
        </div>
      </div>
    </div>
    <div v-if="showBatchConfirm">
      <div class="weui-mask"></div>
      <div class="weui-dialog">
        <div class="weui-dialog__bd">
          <p>{{getBatchConfirmStr()}}</p>
        </div>
        <div class="weui-dialog__ft">
          <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" @click="showBatchConfirm = false">取消</a>
          <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="onBatchSubmit">确定</a>
        </div>
      </div>
    </div>

    <loading v-if="!isShowDetails"></loading>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        wxConfigInfo: null,
        code: null,
        copyCode: null,
        message: null,
        isError: false,
        isShowDetails: true,
        tableData: null,
        salt: null,
        productItemId: null,
        httpRequestUrl: 'https://nb-oa.lianlianlvyou.com',
        bizOder: null,
        searchCompleteModal: false,
        subTitle: null,
        userName: null,
        phoneNumber: null,
        inBatchMode: false, // 开启批量核销
        showBatchModal: false, // 显示批量核销面板
        batchCodeNum: 0,
        showBatchConfirm: false
      }
    },
    mounted () {
    },
    computed: {
      numOfValidCode () {
        if (!this.tableData) return 0
        return this.tableData.filter(e => e.status !== 3).length
      },
      selectedCode () {
        if (!this.tableData) return []
        return this.tableData.filter(e => e.status !== 3 && e.selected)
      }
    },
    methods: {
      getTableData (isShowCode) {
        var code = !this.paramIsNull(this.copyCode) ? this.copyCode : ''
        if (this.paramIsNull(code)) {
          this.isError = true
          this.message = '不是有效的二维码'
          return
        }
        this.isShowDetails = false
        this.$http.get(`/v1/biz/user/code/list?c=${code}&type=1`).then(res => {
          this.isShowDetails = true
          if (!this.paramIsNull(res.body.errMessage)) {
            this.message = res.body.errMessage
            this.isError = true
          } else {
            let tableData = res.body.data
            tableData.forEach(e => {
              e.selected = false
            })
            this.tableData = tableData
            if (!this.paramIsNull(this.tableData)) {
              var info = this.tableData[0]
              this.subTitle = info.subTitle
              this.userName = this.pro_getUserName(info.customerName, info.bookingCustomerName)
              this.phoneNumber = this.pro_getUserPhoneNumber(info.customerPhoneNumber, info.bookingCustomerPhoneNumber)
              if (isShowCode && this.tableData.length === 1 && (this.tableData[0].status === 1 || this.tableData[0].status === 2)) {
                this.bizCodeComplete(this.tableData[0])
              }
            }
          }
        }).catch(res => {
          this.isShowDetails = true
          this.message = '服务器错误'
          this.isError = true
        })
      },
      search () {
        if (this.paramIsNull(this.code)) {
          this.message = '请输入电子码'
          this.isError = true
          return false
        }
        this.copyCode = this.code
        this.getTableData(true)
      },
      bizCodeComplete (row) {
        if (this.paramIsNull(row.code)) {
          this.message = '数据错误'
          this.isError = true
          return false
        }
        this.complete(row)
      },
      complete (row) {
        this.bizOder = row
        this.searchCompleteModal = true
      },
      cancleSearchCompleteModal () {
        this.searchCompleteModal = false
      },
      completeCode () {
        this.searchCompleteModal = false
        var url = `/v1/a/biz/code?c=${this.bizOder.code}&type=5`
        this.isShowDetails = false
        this.$http.post(url).then(function (res) {
          this.isShowDetails = true
          if (res.body.errMessage) {
            this.message = res.body.errMessage
            this.isError = true
          } else {
            this.$message({
              showClose: true,
              message: '核销成功',
              type: 'success'
            })
            this.code = null
            this.getTableData(false)
          }
        }).catch(function (res) {
          this.isShowDetails = true
          this.message = '服务器错误'
          this.isError = true
        })
      },
      close () {
        this.isError = false
        this.message = null
      },
      /**
       * 显示批量操作弹窗
       */
      onOpenBathchModal () {
        this.batchCodeNum = 1
        this.showBatchModal = true
      },
      clearCodeSelect () {
        if (!this.tableData) return
        this.tableData.forEach(e => {
          e.selected = false
        })
      },
      onCancleBatch () {
        this.inBatchMode = false
        this.clearCodeSelect()
      },
      /**
       * 开启批量模式
       */
      onOpenBatchMode () {
        const val = Number(this.batchCodeNum)
        if (!val || isNaN(val) || val <= 0) {
          this.showBatchModal = false
          this.showError('请输入正确的数字')
          return
        }
        this.showBatchModal = false
        this.inBatchMode = true
        this.chooseCode(val)
      },
      chooseCode (n) {
        let validCode = this.tableData.filter(e => e.status !== 3)
        for (let i = 0; i < n; i++) {
          if (!validCode[i]) continue
          validCode[i].selected = true
        }
      },
      onCodeClick (item) {
        if (!this.inBatchMode || item.status === 3) return
        item.selected = !item.selected
      },
      onConfirmBatch () {
        if (this.selectedCode.length === 0) return
        this.showBatchConfirm = true
      },
      batchNumAdd () {
        if (this.batchCodeNum >= this.numOfValidCode) return
        this.batchCodeNum++
      },
      batchNumSub () {
        if (this.batchCodeNum <= 1) return
        this.batchCodeNum--
      },
      /**
       * 提交批量核销操作
       */
      onBatchSubmit () {
        this.showBatchConfirm = false
        let codes = []
        this.selectedCode.forEach(e => {
          codes.push(e.code)
        })
        codes = codes.toString()
        var url = `/v1/a/biz/code/multiple`
        this.isShowDetails = true
        this.$http.post(url, {
          memo: '',
          codes,
          openid: ''
        }).then(function (res) {
          this.isShowDetails = true
          if (res.body.errMessage) {
            this.message = res.body.errMessage
            this.isError = true
          } else {
            this.message = res.body.data
            this.isError = true
            this.code = null
            this.getTableData(false)
          }
        }).catch(function (res) {
          this.isShowDetails = true
          this.message = '服务器错误'
          this.isError = true
        }).then(res => {
          this.inBatchMode = false
          this.clearCodeSelect()
        })
      },
      getBatchConfirmStr () {
        if (this.selectedCode.length === 0) return ''
        const len = this.selectedCode.length
        const firstCode = this.selectedCode[0].code
        return `您确定要核销「${firstCode}」等 ${len} 个电子码?`
      },
      showError (msg = '未知错误') {
        this.isError = true
        this.message = msg
      }
    }
  }
</script>

<style lang="scss">

  .content-container {
    .info-panel{
      padding: 15px 15px;
      position: relative;
      .info-panel-right{
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        padding:0 15px;
        width: 90px;
        .info-right-btns{
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
          padding: 0 15px;
          height: fit-content;
          .info-right-btn{
            height: 40px;
            line-height: 40px;
            text-align: center;
            border-radius: 4px;
            padding: 0 10px;
            background-color: #3cc51f;
            &+.info-right-btn{
              margin-top: 10px;
            }
            &.btn-top{
              background-color: #eb964b;
            }
            a{
              color: #fff;
            }
          }
        }
      }
    }
    .info-batch-tips{
      background-color: #fff;
      text-align: right;
      padding: 5px 15px 5px 15px;
      font-size: 14px;
      color: rgb(145, 145, 145);
    }
  }
  .code_verification {
    margin-top: 20px;
  }

  .scanQrCodeButton {
    margin-top: 20px;
  }

  .weui-label-text {
    width: 80px;
  }

  .right-status-button-sure {
    background-color: #eb964b;
    color: #fff;
    width: 80px;
    text-align: center;
    border-radius: 4px;
    &.disable{
      background-color: #ccc;
      color: #fff;
    }
  }

  .right-status-text {
    width: 100px;
    text-align: center;
  }

  .right-status-button {
    background-color: #3cc51f;
    color: #fff;
    width: 80px;
    text-align: center;
    border-radius: 4px;
    &.disable{
      background-color: #ccc;
      color: #fff;
    }
  }

  .right-status-button-other {
    width: 80px;
    border-radius: 4px;
    text-align: center;
    color: #fff;
    opacity: .7;
    background-color: red;
    pointer-events: none;
    cursor: default;
  }
  .complete_date_text {
    width: 100%;
    font-size: 12px;
    color: red;
  }
  .bactch-input{
    height: 46px;
    margin-bottom: 10px;
    width: 100%;
    #batch-number{
      background: #F8F8F8;
      border: 1px solid #BFBFBF;
      border-radius: 4px;
      height: 46px;
      width: 100%;
      font-family: PingFangSC-Medium;
      font-size: 14px;
      color: #848689;
      letter-spacing: 0;
      line-height: 20px;
      box-sizing: border-box;
      padding: 0 10px;
      text-align: center;
    }
    .batch-number-oprate{
      height: 44px;
      line-height: 44px;
      border: 1px solid #3cc51f;
      margin: 0 3px;
      border-radius: 4px;
      font-size: 20px;
      display: block;
      color: #fff;
      &.add{
        background-color: #3cc51f;
      }
      &.sub{
        background-color: #3cc51f;
      }
    }
  }
</style>
