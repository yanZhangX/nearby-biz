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
            <img :src="scope.row.headImgUrl" width="40" height="40"/>
          </template>
        </el-table-column>
        <el-table-column prop="shopName" label="店名"></el-table-column>
        <!--<el-table-column prop="shopTypeStr" label="店铺类型"></el-table-column>-->
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <div>
              <el-button type="text" @click.stop="unbindWx(scope.row)">解除绑定</el-button>
            </div>
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
        this.$http.get('/v1/biz/user/wx/binding/list', {
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
            this.rowCount = res.body.data.rowCount
          }
        }).catch(res => {
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
          this.$http.post(`/v1/biz/user/wx/unbind?id=${row.id}`).then(res => {
            if (res.body.errMessage) {
              this.$message.error(res.body.errMessage)
            } else {
              this.$message.success(res.body.data)
              this.getTableData()
            }
          }).catch(e => {
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
