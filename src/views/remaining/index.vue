<template>
  <div class="dashboard-container height100">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>余额</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="main-container">
      <div class="info-content-container">
        余额: ¥{{balance}}
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data: () => ({
    balance: ''
  }),

  methods: {
    getData () {
      this.$http.get('/v1/a/biz/remaining')
        .then((res) => {
          this.balance = res.data.data
        })
    }
  },

  created () {
    this.getData()
  }
}
</script>
