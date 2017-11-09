<template>
  <div class="login-container">

    <div class="blur">
    </div>


    <!--<canvas id="canvas"></canvas>-->
    <div id="login-container">
      <div class="login-box-container">
        <div class="login-logo-container">
          <img src="/static/img/login/logo.png" alt="">
        </div>
        <div class="login-form-container">
          <div class="ui input">
            <input type="text" class="ipt-text" v-model="login.userName" placeholder="请输入用户名">
          </div>
          <div class="ui input">
            <input type="password" class="ipt-text" v-model="login.password" placeholder="请输入密码">
          </div>
          <div class="ui button">
            <button type="button" class="btn-login" name="button" @click="onSubmit">登录</button>
          </div>
        </div>
      </div>

      <div class="login-left-container">
        <div class="welcome">Welcome!</div>
        <div class="content">Today will be great!</div>
      </div>
    </div>

    <div class="login-footer-container">
      地方联科技成都有限公司版权所有 Copyright 2017 - 2018 <br>
      欢迎您使用联联周边游商家系统
    </div>
  </div>
</template>

<style lang="scss" scoped>

  .blur{
    width: 100%;
    height: 100%;
    position: absolute;
    margin: 0 auto;
    left: 0;
    top: 0;
    filter: blur(5px);
    -webkit-filter: blur(5px);
    -moz-filter: blur(5px);
    -ms-filter: blur(5px);
    -o-filter: blur(5px);
    z-index: 0;
    display: block;
    background-image: url('/static/img/login/login_bg.jpg');
  }

  #canvas {
    position: absolute;
    margin: 0 auto;
    left: 0;
    top: 0;
  }

  .login-container{
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.00);
    /*background-image: url('/static/img/login/bg.jpg');*/
    /*background-repeat: round;*/
    /*position: relative;*/
    /*overflow: hidden;*/
  }

  #login-container {
    margin: 0 auto;
    padding: 1em;
    /*border-radius: .3em;*/
    width: 776px;
    box-shadow: 0 0 0 1px hsla(0,0%,100%,.3) inset, 0 .5em 1em rgba(0, 0, 0, 0.6);
    /*text-shadow: 0 1px 1px hsla(0,0%,100%,.3);*/
    background: hsla(0,0%,100%,0.00);
    top: calc(50% - 227px);
    left: calc(50% - 338px);
    position: absolute;
  }

  .login-box-container{
    background: #FFFFFF;
    width: 338px;
    float: right;
    margin-top: -1em;
    margin-bottom: -1em;
    margin-right: -1em;
    /*position: absolute;*/
    /*z-index: 2;*/
  }

  .login-left-container{
    float: left;
    width: 338px;
    color: #29a0cf;
    .welcome {
      font-size: 60px;
    }

    .content {
      font-size: 32px;
    }
  }

  .login-logo-container{
    height: 100%;
    display: flex;
    margin-top: 53px;
    justify-content: center;
    align-items: center;
  }

  .login-form-container{
    padding: 0 30px 55px;
    margin-top: 45px;
  }

  .ui.input{
    margin-bottom: 16px;
  }

  .ui.input input, .ui.button button{
    height: 40px;
    width: 100%;
    border-radius: 4px;
    font-size: 14px;
    padding: 0;
    margin: 0;
  }

  .ipt-text{
    background: #FFFFFF;
    border: 1px solid #D7D7D7;
    color: #333;
    text-indent: 10px;
  }

  .btn-login{
    background: #129AEE;
    border-radius: 4px;
    border: 1px solid transparent !important;
    color: white;
  }

  .login-footer-container{
    width: 100%;
    font-size: 14px;
    color: #FFFFFF;
    letter-spacing: 0.28px;
    text-align: center;
    position: absolute;
    bottom: 30px;
    z-index: 1;
  }

</style>

<script>
import Vue from 'vue'
import router from '@/router'
import {setToken, getToken} from 'CONST'
export default {
  name: 'login',
  data () {
    return {
      position: 'left',
      login: {
        userName: '',
        password: ''
      }
    }
  },
  methods: {
    switchOld: function () {
      location.href = 'http://crm.2tai.net'
    },
    onSubmit () {
      if (this.login.userName === '' || this.login.password === '') {
        return
      } else {
        this.$http.post('/v1/biz/user', {
          account: this.login.userName,
          pwd: this.login.password
        }).then(function (res) {
          if (res.body.errMessage) {
            this.$message({
              showClose: true,
              message: res.body.errMessage,
              type: 'error'
            })
          } else {
            setToken(res.body.data.token)
            Vue.http.headers.common['Authorization'] = getToken()
            router.push('/')
          }
        }).catch(function (res) {
          this.$message({
            showClose: true,
            message: '服务器连接超时',
            type: 'error'
          })
        })
      }
    }
  }
}
</script>
