import moment from 'moment'

export default{
  install (Vue, options) {
    Vue.prototype.paramIsNull = function (param) {
      if (typeof (param) === 'undefined' || param === null) {
        return true
      } else if (param instanceof Array) {
        if (param.length === 0) {
          return true
        } else {
          return false
        }
      } else if (typeof (param) === 'string') {
        if (param.replace(/(^\s*)|(\s*$)/g, '').length === 0) {
          return true
        } else {
          return false
        }
      }
      return false
    }
    Vue.prototype.paramIsNullAndZero = function (param) {
      if (this.paramIsNull(param)) {
        return true
      } else if (typeof (param) === 'number' && param === 0) {
        return true
      }
      return false
    }
    Vue.prototype.dateFormat = function (param, format) {
      if (typeof (param) === 'undefined' || param === null) {
        return ''
      } else {
        return moment(param).format(format)
      }
    }
    Vue.prototype.weekFormat = function (value) {
      if (!this.paramIsNull(value)) {
        var date = new Date(value)
        var week = ''
        var weekDay = date.getDay()
        switch (weekDay) {
          case 0:
            week = '星期日'
            break
          case 1:
            week = '星期一'
            break
          case 2:
            week = '星期二'
            break
          case 3:
            week = '星期三'
            break
          case 4:
            week = '星期四'
            break
          case 5:
            week = '<p style="color: red;">星期五</p>'
            break
          case 6:
            week = '<p style="color: red;">星期六</p>'
            break
        }
        return week
      } else {
        return ''
      }
    }
    Vue.prototype.pro_isWechatClient = function () {
      var ua = window.navigator.userAgent.toLowerCase()
      var str = ua.match(/MicroMessenger/i)
      if (!this.paramIsNull(str)) {
        return true
      } else {
        return false
      }
    }
    Vue.prototype.pro_addQueryString = function (url, name, value) {
      let currentUrl = url.split('#')[0]
      if (/\?/g.test(currentUrl)) {
        if (/name=[-\w]{4,25}/g.test(currentUrl)) {
          currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + '=' + value)
        } else {
          currentUrl += (currentUrl.endsWith('?') ? '' : '&') + name + '=' + value
        }
      } else {
        currentUrl += '?' + name + '=' + value
      }
      if (url.split('#')[1]) {
        return currentUrl + '#' + url.split('#')[1]
      } else {
        return currentUrl
      }
    }
    Vue.prototype.pro_deleteQueryString = function (url, name) {
      let reg = new RegExp('(|&)' + name + '=([^&/#]*)')
      let str = url.match(reg)
      if (str && str[0]) {
        let newurl = url.replace(str[0], '')
        return newurl.replace('?&', '?').replace('?#', '#')
      }
      return url
    }
    Vue.prototype.pro_getQueryString = function (name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
      if (window.location.search.indexOf('=') > -1) {
        let r = window.location.search.substr(1).match(reg)
        if (r) {
          return unescape(r[2])
        }
      }
      return ''
    }
  }
}
