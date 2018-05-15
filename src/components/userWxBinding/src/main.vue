<template>
  <div id="fullscreen-login-bg">
    <div class="fullscreen-login-bg">
      <div class="fullscreen-login-contain">
        <div>
          <span>第一步：</span>
          <span>请扫描下图二维码，关注「联联周边游成都站」后，即可在微信接收商家后台通知</span>
        </div>
        <div>
          <img :src="qrCodeUrl">
        </div>
        <div>
          <span>第二步：</span>
          <span>请扫描下图二维码，完成个人微信账号绑定后，接收微信通知</span>
        </div>
        <div>
          <img :src="bindingUrl">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  /*
   * http://crm.2tai.net/#/
   * 15828459830 18989193368
   * 98308182 88664422
   * */
//  import Vue from 'vue'
//  import router from '@/router'
//  import {appHost, getUser, setToken} from 'CONST'
  export default {
    data () {
      return {
        qrCodeUrl: null,
        bindingUrl: null
      }
    },
    created () {
      console.log('created')
      var _this = this
      window.parentWechatLogin = function (json) {
        var code = json.code
        var state = json.state
        _this.wechatLogin(code, state)
      }
    },
    methods: {
    }
  }
</script>

<style lang="scss" scoped>
  .fullscreen-login-bg {
    width: 100%;
    height: 100%;
    position: fixed;
    z-index: 2000;
    background-color: #515151;
    left: 0px;
    top: 0px;
    bottom: 0px;
    right: 0px;
  }

  .fullscreen-login-contain {
    width: 100%;
    height: auto;
    margin-top: 50px;
    display: block;
    text-align: center;
  }
</style>
