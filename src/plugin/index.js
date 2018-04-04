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
  }
}
