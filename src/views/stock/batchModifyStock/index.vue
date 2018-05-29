<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <span @click="back()">库存管理</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item>批量修改</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">
      <div class="r">
        <el-button type="primary" icon="plus" @click="cancelSelect()" v-if="tableDataCount">取消选择</el-button>
        <el-button type="primary" v-if="tableDataCount" @click="confirmSelect()">确认选择</el-button>
      </div>
    </div>
    <div class="main-container">
      <table v-if="tableDataCount" :width="width * 7">
        <tbody>
        <tr v-for="n in tableDataCount" :key="n - 1">
          <td :width="width" :height="height" v-for="m in 7" :key="m - 1">
            <el-card :class="tableData[(n - 1) * 7 + m - 1].className"
                     shadow="always"
                     v-if="!paramIsNull(tableData[(n - 1) * 7 + m - 1])"
                     @click.native="cardClick((n - 1) * 7 + m - 1)" @mouseenter.native="mouseEnter((n - 1) * 7 + m - 1)">
              <span class="calender-date" v-html="tableData[(n - 1) * 7 + m - 1].bookingDay"></span>
              <span class="calender-stock" v-html="'<br/>库存数量：' + tableData[(n - 1) * 7 + m - 1].stockAmount"></span>
              <span class="calender-stock" v-html="'<br/>预约：' + tableData[(n - 1) * 7 + m - 1].bookingAmount"></span>
              <span class="calender-stock" v-html="'<br/>核销：' + tableData[(n - 1) * 7 + m - 1].completeAmount"></span>
              <span class="calender-weekend" v-html="'<br/>' + tableData[(n -1) * 7 + m - 1].weekDay"></span>
            </el-card>
          </td>
        </tr>
        </tbody>
      </table>
      <div v-else style="text-align: center;">暂无数据</div>
    </div>

    <el-dialog :visible.sync="productStockModal" title="设置库存" :close-on-click-modal="false" :show-close="false" close-on-press-escape>
      <div class="modal-info-container">
        <div class="info-content-container">
          <el-form label-width="100px">
            <el-form-item label="库存：">
              <el-input-number v-model="stockAmount" :min="0" label="请设置库存" ></el-input-number>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="productStockModal = false">关闭</el-button>
        <el-button type="primary" @click="prodcutStockChange">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  let WIDTH = 140
  let HEIGHT = 170
  import router from 'ROUTE'
  export default {
    data () {
      return {
        id: null,
        width: WIDTH,
        height: HEIGHT,
        style: 'width: ' + WIDTH + 'px;height:' + HEIGHT + 'px;margin-right: 5px;padding: 0px;display:inline-block',
        tableData: null,
        isMouseClick: false,
        startIndex: -1,
        isMouseMove: false,
        tableDataCount: 0,
        productStockModal: false,
        stockAmount: null
      }
    },
    created () {
      var id = this.$route.query.id
      if (!this.paramIsNull(id)) {
        this.id = parseInt(id)
        this.getTableData()
      }
    },
    watch: {
    },
    methods: {
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '数据加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get(`/v1/a/biz/stock/list/all?id=${this.id}`).then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            var tableData = res.body.data.data
            if (!this.paramIsNull(tableData)) {
              this.tableData = []
              var countDay = tableData.length
              var booking = tableData[0]
              var startDate = new Date(booking.bookingDay)

              var weekDay = startDate.getDay()
              this.tableDataCount = parseInt(countDay / 7) + 1
              var startIndex = weekDay - 1
              if (startIndex < 0) {
                startIndex = 6
              }
              if (countDay < 7) {
                startIndex = 0
              }
              this.tableData = []
              for (var i = 0; i < countDay; i++) {
                var item = tableData[i]
                item.className = 'my-el-card'
                item.select = false
                item.confirm = false
                item.weekDay = this.weekFormat(item.bookingDay)
                this.tableData[startIndex + i] = item
              }
              this.total = res.body.data.rowCount
              this.pageCount = res.body.data.pageCount
              this.rowCount = res.body.data.rowCount
            }
          }
        }).catch(res => {
          loading.close()
          this.$message.error('服务器繁忙！')
        })

//        this.tableData = []
//        this.selectDateList = []
//
//        var startDate = new Date('2018-03-01')
//        var endDate = new Date('2018-04-01')
//
//        var startTimestamp = Date.parse(startDate)
//        var endTimestamp = Date.parse(endDate)
//        var countDay = Math.floor((endTimestamp - startTimestamp) / (24 * 3600 * 1000))
//        var weekDay = startDate.getDay()
//        this.tableDataCount = parseInt(countDay / 7) + 1
//        var startIndex = weekDay - 1
//        if (countDay < 7) {
//          startIndex = 0
//        }
//        for (var i = startIndex; i <= countDay + startIndex; i++) {
//          var date = new Date(startDate)
//          date.setDate(startDate.getDate() + i - startIndex)
//
//          this.tableData[i] = {
//            stock: 100,
//            booking: 12,
//            complete: 5,
//            date: this.pro_yyyyMMDD(null, null, date),
//            weekDay: this.weekFormat(date),
//            select: false,
//            className: 'my-el-card'
//          }
//        }
      },
      cardClick (index) {
        this.isMouseClick = !this.isMouseClick
        if (this.isMouseClick) {
          this.startIndex = index
        } else {
          if (this.startIndex === index) {
            var item = this.tableData[index]
            if (!this.paramIsNull(item)) {
              item.select = true
              item.confirm = item.select
              item.className = (item.select ? ' my-el-card-select' : 'my-el-card')
            }
          } else {
            for (var x = 0; x <= this.tableData.length; x++) {
              var itemX = this.tableData[x]
              if (!this.paramIsNull(itemX) && itemX.select) {
                itemX.confirm = itemX.select
                itemX.className = (itemX.select ? ' my-el-card-select' : 'my-el-card')
              }
            }
          }
          this.startIndex = -1
        }
      },
      mouseEnter (index) {
        if (!this.isMouseClick || this.startIndex === -1) {
          return
        }
        var start = index >= this.startIndex ? this.startIndex : index
        var end = index >= this.startIndex ? index : this.startIndex
        for (var x = 0; x <= this.tableData.length; x++) {
          var itemX = this.tableData[x]
          if (!this.paramIsNull(itemX) && !itemX.confirm) {
            itemX.select = false
            itemX.className = (itemX.select ? ' my-el-card-select' : 'my-el-card')
          }
        }
        for (var i = start; i <= end; i++) {
          var item = this.tableData[i]
          if (!this.paramIsNull(item)) {
            item.select = true
            item.className = (item.select ? ' my-el-card-select' : 'my-el-card')
            this.$set(this.tableData, i, item)
          }
        }
      },
      back () {
        router.push({
          name: 'stockManage'
        })
      },
      cancelSelect () {
        this.isMouseClick = false
        this.startIndex = -1
        for (var i = 0; i <= this.tableData.length; i++) {
          var item = this.tableData[i]
          if (!this.paramIsNull(item)) {
            item.select = false
            item.confirm = item.select
            item.className = (item.select ? ' my-el-card-select' : 'my-el-card')
            this.$set(this.tableData, i, item)
          }
        }
      },
      confirmSelect () {
        var days = []
        this.tableData.forEach((item, index, array) => {
          if (item.select) {
            days.push(new Date(item.bookingDay).getTime())
          }
        })
        if (days.length === 0) {
          this.pro_message_error(null, '请选择需要设置库存的日期')
          return
        }
        this.stockAmount = null
        this.productStockModal = true
      },
      prodcutStockChange () {
        if (this.stockAmount === null) {
          this.pro_message_error(null, '参数错误')
          return
        }
        var days = []
        this.tableData.forEach((item, index, array) => {
          if (item.select) {
            days.push(new Date(item.bookingDay).getTime())
          }
        })
        if (days.length === 0) {
          this.pro_message_error(null, '请选择需要设置库存的日期')
          return
        }
        this.productStockModal = false
        const h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认要将所选中天数的库存修改为（'),
            h('span', {style: 'color: red;'}, this.stockAmount),
            h('span', null, '）吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认修改',
          cancelButtonText: '再考虑一下',
          type: 'warning',
          center: true
        }).then(() => {
          var loading = this.$loading({
            lock: true,
            text: '设置中……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          this.$http.post(`/v1/a/biz/stock/update/all`, {
            id: this.id,
            stockAmount: this.stockAmount,
            days: days
          }).then(res => {
            loading.close()
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success('设置成功')
              this.getTableData()
            }
          }).catch(e => {
            loading.close()
            this.$message.error('服务器错误！')
            this.productStockModal = true
          })
        })
      }
    }
  }
</script>


<style lang="scss" scoped>
  .my-el-card {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;

    .calender-date {
      font-size: 16px;
    }
    .calender-stock {
      font-size: 10px;
    }
  }
  .my-el-card:hover {
    background-color: #BFBFBF;

    .calender-date {
      font-size: 16px;
      color: white;
    }
    .calender-stock {
      font-size: 10px;
      color: white;
    }
    .calender-weekend {
      color: white;
    }
  }
  .my-el-card-select {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    background-color: #20A0FF;

    .calender-date {
      font-size: 16px;
      color: white;
    }
    .calender-stock {
      font-size: 10px;
      color: white;
    }
    .calender-weekend {
      color: white;
    }
  }
</style>
