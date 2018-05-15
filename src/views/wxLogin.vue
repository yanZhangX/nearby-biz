<template>
  <div class="login-container">
    <div class="blur">
    </div>

    <!--<canvas id="canvas"></canvas>-->
    <div id="login-container">
      <!--<div class="login-box-container">-->
        <!--<div class="login-logo-container">-->
          <!--<img src="/static/img/login/login_logo.png" alt="">-->
        <!--</div>-->
        <!--<div v-if="loginType === 'userLogin'" class="login-form-container-input">-->
        <!--</div>-->
        <!--<div class="login-form-container">-->
          <!--<div v-if="loginType === 'wechatQRCode'" id="wechat_login_container" ref="wechat_login_container"></div>-->
        <!--</div>-->
      <!--</div>-->
      <div class="login-left-container">
        <div class="welcome" v-if="welcome">温馨提示</div>
        <div class="content" v-html="message"></div>
      </div>
    </div>

    <div class="login-footer-container">
      地方联科技成都有限公司版权所有 Copyright 2016 - 2017 <br>
      欢迎您使用联联周边游产品系统
    </div>
  </div>
</template>

<script>
  /*
   * http://crm.2tai.net/#/
   * 15828459830 18989193368
   * 98308182 88664422
   * */
  export default {
    data () {
      return {
        id: null,
        message: null,
        welcome: true
      }
    },
    mounted () {
    },
    created () {
      this.userLogin()
    },
    methods: {
      userLogin () {
        var code = this.pro_getQueryString('code')
        var state = this.pro_getQueryString('state')
        var a = this.pro_getQueryString('a')
        if (this.pro_isWechatClient() && !this.paramIsNull(code) && !this.paramIsNull(state) && !this.paramIsNull(a)) {
          // 直接授权登录
          this.id = a
          this.message = '账号绑定中……'
          this.wechatOAuthLogin(code, state, a)
        } else {
          this.message = '数据错误'
          this.$message.error(this.mes)
        }
      },
      wechatOAuthLogin (code, state, a) {
//        this.message = '<span style="color: red;line-height: 100px;font-size: 60px;">恭喜您！</span><br/>' +
//          '<div style="text-align: left;margin-top: 40px;">您的登录账号绑定微信成功，请确保已经关注「联联周边游成都站」，后续您将在微信收到该站点发出的通知！</div>'
//        this.welcome = false
        // 微信授权登录
        this.$http.get(`/v1/biz/user/wechat/binding?code=${code}&state=${state}&a=${a}`).then(res => {
          if (res.body.errMessage) {
            this.message = res.body.errMessage
            this.$message.error(this.message)
          } else {
            this.message = res.body.data
            this.welcome = false
            this.$message.success('绑定成功')
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  #wechat_login_container {
    width: 100%;
    height: 230px;
  }
  .user_login_container {
    width: 100%;
    height: auto;
    margin-top: 50px;
  }
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
    background-image: url('/static/img/login/bg.jpg');
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
    left: calc(50% - 400px);
    position: absolute;
  }

  .login-box-container{
    background: #FFFFFF;
    width: 100%;
    float: right;
    margin-top: -1em;
    margin-bottom: -1em;
    margin-right: -1em;
    /*position: absolute;*/
    /*z-index: 2;*/
  }

  .login-left-container{
    float: left;
    width: 100%;
    color: #29a0cf;
    margin: 50px 0px;
    .welcome {
      font-size: 60px;
      display: block;
      text-align: center;
    }

    .content {
      margin: 50px 20px;
      font-size: 32px;
      display: block;
      text-align: center;
      letter-spacing: 2px;
      line-height: 40px;
    }
  }

  .login-logo-container{
    height: 100%;
    display: flex;
    margin-top: 25px;
    justify-content: center;
    align-items: center;
  }

  .login-form-container{
    padding: 10px 20px 55px;
    margin-top: 0px;
  }

  .login-form-container-input {
    padding: 10px 30px 55px;
    margin-top: 50px;
  }

  .user-binding-ui {
    color: red;
    font-size: 12px;
    margin-bottom: 10px;
    margin-left: 10px;
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
