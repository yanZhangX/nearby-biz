import Vue from 'vue'
import moment from 'moment'

Vue.filter('date', function (value, format) {
  if (value) {
    return moment(value).format(format)
  } else {
    return '无'
  }
})

Vue.filter('currency', function (value) {
  return '￥' + (value).toFixed(2)
})

Vue.filter('infoTimeFormatter', function (timpstamp, format) {
  if (timpstamp == null || timpstamp === '') return ''
  let d = new Date()
  d.setTime(timpstamp)
  console.log(d)
  console.log(d.getHours())
  console.log(d.getMinutes())
  let date = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    'S+': d.getMilliseconds()
  }
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in date) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1
        ? date[k] : ('00' + date[k]).substr(('' + date[k]).length))
    }
  }
  return format
})
