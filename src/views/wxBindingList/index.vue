<template>
  <div class="stock">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>微信绑定列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="filter">

    </div>
    <div class="main-container">
      <el-table :data="tableData" stripe scope="scope" max-height=2000>
        <el-table-column prop="nickName" label="昵称" min-width="100"></el-table-column>
        <el-table-column prop="headImgUrl" label="头像" min-width="80">
          <template scope="scope">
            <img :src="scope.row.headImgUrl" width="40" height="40" min-width="60"/>
          </template>
        </el-table-column>
        <el-table-column prop="shopName" label="店名" min-width="100"></el-table-column>
        <el-table-column prop="subscribeStr" label="关注状态" min-width="200">
          <template scope="scope">
            <div v-html="scope.row.subscribeStr"></div>
          </template>
        </el-table-column>
        <el-table-column prop="openStr" label="用户预定成功通知" min-width="100"></el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <div>
              <el-button type="text" @click.stop="unbindWx(scope.row)">解除绑定</el-button>
              <el-button type="text" @click.stop="openOrCloseNotifiation(scope.row)" v-if="scope.row.isOpen === 1">关闭通知</el-button>
              <el-button type="text" @click.stop="openOrCloseNotifiation(scope.row)" v-if="scope.row.isOpen === 0" style="color: red;">开启通知</el-button>
            </div>
          </template>
        </el-table-column>
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
        currentPage: 1,
        pageSize: 15,
        total: null,
        rowCount: 0,
        pageCount: 0
      }
    },
    computed: {},
    methods: {
      getTableData () {
        var loading = this.$loading({
          lock: true,
          text: '加载中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$http.get('/v1/biz/user/wx/binding/list', {
          params: {
            pageSize: this.pageSize,
            pageIndex: this.currentPage
          }
        }).then(res => {
          loading.close()
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.tableData = res.body.data.data
            this.total = res.body.data.rowCount
            this.pageCount = res.body.data.pageCount
            this.rowCount = res.body.data.rowCount
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
      unbindWx (row) {
        const h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认要解除'),
            h('span', {style: 'color: red;'}, row.shopName),
            h('span', null, '('),
            h('span', {style: 'color: red;'}, row.nickName),
            h('span', null, ')绑定吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认解除',
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
          this.$http.post(`/v1/biz/user/wx/unbind?id=${row.id}`).then(res => {
            loading.close()
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success(res.body.data)
              this.getTableData()
            }
          }).catch(e => {
            loading.close()
            this.$message.error('服务器错误！')
          })
        })
      },
      openOrCloseNotifiation (row) {
        var operation = '关闭'
        if (row.isSubscribe === 0) {
          operation = '开启'
        }
        const h = this.$createElement
        this.$msgbox({
          title: '温馨提示',
          message: h('p', null, [
            h('span', null, '确认要' + operation + '微信公众号推送给（'),
            h('span', {style: 'color: red;'}, row.nickName),
            h('span', null, ')的通知吗？')
          ]),
          showCancelButton: true,
          confirmButtonText: '确认' + operation,
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
          this.$http.post(`/v1/biz/user/wx/update/open?id=${row.id}`).then(res => {
            loading.close()
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success(res.body.data)
            }
            this.getTableData()
          }).catch(e => {
            loading.close()
            this.$message.error('服务器错误！')
          })
        })
      }
    },
    created () {
      this.getTableData()
    }
  }
</script>
