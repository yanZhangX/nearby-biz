<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>核销功能</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div v-for="(item, index) in tableData">
      <div class="code-search-contaienr">
        <input type="text" placeholder="请输入电子码" class="code-search-input" v-model="item.keywords" @keyup.enter="onClickConsume(true, item.keywords)">
        <el-button class="code-search-btn" @click="onClickConsume(true, item.keywords)">查询核销</el-button>
      </div>
    </div>
    <button class="clearcode-search-btn" @click="clear">清空</button>
    <consume-model :code="code" :type="0" v-if="isWillConsume"></consume-model>
  </div>
</template>

<script>
  import moment from 'moment'
  import ConsumeModel from 'COMPONENT/consume'

  export default {
    name: 'consume',
    components: {ConsumeModel},

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
        isWillConsume: false,
        code: ''
      }
    },
    computed: {},
    created () {
    },
    methods: {
      onUpdate () {
      },
      onClickConsume (isWillConsume, code) {
        this.code = code
        this.isWillConsume = isWillConsume
      },
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
      }
    }
  }
</script>
