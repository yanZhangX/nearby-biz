<template>
  <div class="warpper">
    <div class="header">
      <h1><router-link to="/">联联周边游商家系统</router-link></h1>

      <div class="menu-container" @mouseenter="handleShowUserMenu" @mouseleave="handleHideUserMenu">
        <span class="k-center h60 k-dropdown">
          <span class="ml menu-title">{{name}}</span>
          <i class="el-icon-caret-bottom el-icon--right"></i>
        </span>
        <div class="k-menu" ref="userMenu">
          <div class="k-menu-item" @click="handleChangePwd">
            <img src="/static/img/home/icon_password.png" alt="" class="mr">
            <span>修改密码</span>
          </div>
          <div class="k-menu-item" @click="logout">
            <img src="/static/img/home/icon_exit.png" alt="" class="mr">
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
    <el-row class="main k-sidebar-main">
      <el-col :sm="4" class="aside k-sidebar">
        <el-menu :router="true" :unique-opened="true" class="k-el-menu">
          <template v-for="item in userMenus">
            <el-menu-item :index="item.id" class="k-sidebar-el-menu-item" :class="!menuItemId && defaultActive === item.id? 'is-active': ''" v-if="item.menus == null" :key="item.id" :route="{path:item.path || '/'}" @click="handleMenuItemClick(item.id)">
              <img :src="menuItemUri(item.id, item.icon)" alt="">
              <span class="ml15">{{item.name}}</span>
            </el-menu-item>
            <el-submenu :index="item.id" v-else :key="item.id">
              <template slot="title">
                <img :src="menuItemUri(item.id, item.icon)" alt="">
                <span class="ml15">{{item.name}}</span>
              </template>
              <el-menu-item v-for="i in item.menus" :index="i.id" :key="i.id" :route="{path:i.path || '/'}" @click="handleMenuItemClick(item.id)">
                <span class="ml30">{{i.name}}</span>
              </el-menu-item>
            </el-submenu>
          </template>
        </el-menu>
      </el-col>
      <el-col :sm="20" class="view height100">
        <router-view></router-view>
      </el-col>
    </el-row>
    <el-dialog class="modify-pass" @close="" title="修改密码" v-model="isModalOpen" :close-on-click-modal="false">
      <el-form :model="pwd" label-width="100px">
        <el-form-item label="旧密码">
          <el-input type="text"  placeholder="请输入旧密码" v-model="pwd.old"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="text"  placeholder="请输入新密码" v-model="pwd.new"></el-input>
        </el-form-item>
        <el-form-item label="重复新密码">
          <el-input type="text"  placeholder="请重复输入新密码" v-model="pwd.reNew"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isModalOpen = false">取 消</el-button>
        <el-button type="primary" @click="modifyPass">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
  .el-dialog__body{
    padding-bottom: 0;
  }
  .warpper{
    height: 100%;
    .header{
      background: #FFFFFF;
      box-shadow: 0 0 10px 0 rgba(0,0,0,0.10);
      height: 60px;
      position: relative;
      h1{
        line-height: 1.3;
        font-size: 16px;
        margin: 0;
        line-height: 60px;
        text-align: left;
        padding-left: 50px;
        color: #333;
        font-weight: bolder;
      }
    }
  }
</style>

<script>
  import Vue from 'vue'
  import router from '@/router'
  import {getToken, setToken, setUser, getUser} from 'CONST'

  export default {
    name: 'index',
    data () {
      return {
        isModalOpen: false,
        pwd: {
          old: null,
          new: null,
          reNew: null
        },
        defaultActive: null,
        userMenus: [],
        headIconUrl: '',
        name: '',
        phoneNumber: '',
        menuItemId: ''
      }
    },
    computed: {

    },
    methods: {
      menuItemUri (itemId, itemIcon) {
        if (!this.menuItemId && itemId === this.defaultActive) {
          return '/static/img/home/' + itemIcon + '_active.png'
        }

        if (itemId === this.menuItemId) {
          return '/static/img/home/' + itemIcon + '_active.png'
        } else {
          return '/static/img/home/' + itemIcon + '.png'
        }
      },
      handleShowUserMenu () {
        this.$refs.userMenu.style.height = '80px'
      },
      handleHideUserMenu () {
        this.$refs.userMenu.style.height = '0'
      },
      modifyPass: function () {
        if (!this.pwd.old) {
          this.$message.error('请输入原密码')
          return
        }
        if (!this.pwd.new) {
          this.$message.error('请输入新密码')
          return
        }
        if (!this.pwd.reNew) {
          this.$message.error('请重复输入新密码')
          return
        }
        if (this.pwd.reNew !== this.pwd.new) {
          this.$message.error('两次密码输入不一致')
          return
        }
        this.$http.post('/v1/a/biz/update/pwd', {
          uid: getUser().id,
          oldPwd: this.pwd.old,
          newPwd: this.pwd.new
        }).then((res) => {
          if (res.body.errMessage) {
            this.$message.error(res.body.errMessage)
          } else {
            this.$message({
              message: '恭喜你，修改密码成功，请牢记新密码',
              type: 'success'
            })
            this.isModalOpen = false
            router.push('/login')
          }
        }).catch((res) => {
          this.$message.error('服务器繁忙')
        })
      },
      tokenWrong (code) {
        // code 1 token, 2 no rights
        router.push('/no-resource/' + code)
      },
      menuSelect () {
        this.userMenus.forEach(value => {
          if (value.path === '/') {
            this.defaultActive = value.id
          }
        })
      },

      handleMenuItemClick (itemId) {
        this.menuItemId = itemId
      },

      handleChangePwd () {
        this.pwd.old = null
        this.pwd.new = null
        this.pwd.reNew = null
        this.isModalOpen = true
      },

      logout () {
        this.$confirm('即将退出登录，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          setToken(null)
          setUser(null)
          Vue.http.headers.custom['Authorization'] = getToken()
          router.push('/login')
        }).catch(() => {})
      }
    },
    watch: {
      '$route': 'menuSelect'
    },
    beforeRouteEnter (to, from, next) {
      Vue.http.get('/v1/a/biz/userinfo').then(function (res) {
        if (res.body.errMessage) {
          router.push('/login')
        } else {
          if (res.body.data.userMenus && res.body.data.userMenus.length === 0) {
            next(vm => {
              vm.tokenWrong(2)
            })
          } else {
            next(vm => {
              setUser({
                id: res.body.data.uid,
                name: res.body.data.name,
                headPic: res.body.data.headIconUrl,
                phone: res.body.data.phoneNumber
              })
              vm.headIconUrl = res.body.data.headIconUrl
              vm.name = res.body.data.name
              vm.phoneNumber = res.body.data.phoneNumber
              let userMenus = res.body.data.userMenus
              userMenus.forEach(value => {
                value.id = value.id + ''
                if (!!value.menus && value.menus.length >= 0) {
                  value.menus.forEach((val) => {
                    val.id = val.id + ''
                  })
                }
              })
              vm.userMenus = userMenus
              vm.menuSelect()
            })
          }
        }
      }).catch(function (res) {
        next(vm => {
          vm.tokenWrong(1)
        })
      })
    }
  }
</script>
