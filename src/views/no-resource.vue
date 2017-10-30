<template>
  <div class="no-resource-container">
    <div class="no-resource-content">
      <p>
        <img src="/static/img/404.png" alt="">
      </p>
      <p>
        登录超时，请重新登录！
      </p>
      <p>
        <el-button type="info" @click="login" class="btn-back">返回登录</el-button>
      </p>
    </div>
    <div class="no-resource-footer">
      联联周边游商家系统
    </div>
  </div>
</template>

<style>
  .no-resource-container{
    background-color: #EFF2F7;
    width: 100%;
    height: 100%;
    text-align: center;
    position: relative;
  }

  .no-resource-content{
    position: absolute;
    width: 100%;
    top: 28%;
    font-size: 24px;
    color: #2B333B;
    letter-spacing: 0.48px;
  }

  .btn-back{
    width: 150px;
    height: 40px;
    margin-top: 50px;
  }

  .no-resource-footer{
    position: absolute;
    width: 100%;
    bottom: 20px;
    font-size: 14px;
    color: #BFBFBF;
    letter-spacing: 0.28px;
  }

</style>
<script>
  export default {
    methods: {
      login () {
        this.$router.push('/login')
      }
    }
  }
</script>
