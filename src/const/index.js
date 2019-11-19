const isDebug = (function () {
  let hostname = location.hostname
  let reg = /(^192.168)|(^192.167)|(^localhost)/
  return reg.test(hostname) && process.env['NODE_ENV'] === 'development'
})()

const appHost = function () {
  if (isDebug) {
    // return 'https://api-biz.lianlianlvyou.com'
    // return 'https://apibiz.lianlianlvyou.com' // cdn
    // return 'http://192.167.10.122:6868' // 马哥
    return 'http://192.167.10.166:8080' // 杨永玲
  }
  return 'https://apibiz.lianlianlvyou.com' // cdn
}

const getToken = function () {
  return localStorage.getItem('token')
}
const setToken = function (tk) {
  if (tk) {
    localStorage.setItem('token', tk)
  } else {
    localStorage.removeItem('token')
  }
}

const getUser = function () {
  return window.JSON.parse(localStorage.getItem('user'))
}
const setUser = function (obj) {
  if (obj) {
    localStorage.setItem('user', window.JSON.stringify(obj))
  } else {
    localStorage.removeItem('user')
  }
}

const getPageIndex = function (name) {
  if (name) {
    return window.JSON.parse(localStorage.getItem(name))
  } else {
    console.error('getPageIndex fn must provide arg:name typeof string')
  }
}
const setPageIndex = function (obj) {
  if (obj && obj.name && obj.value && !isNaN(obj.value)) {
    localStorage.setItem(obj.name, obj.value)
    return obj
  } else {
    console.error('pageIndex must be an obj and pageIndex.value must be a number')
  }
}
const removePageIndex = function (name) {
  if (name) {
    localStorage.removeItem(name)
  } else {
    console.error('removePageIndex fn must provide arg:name typeof string')
  }
}

const json2Prams = function (obj) {
  let keys = Object.keys(obj)
  let str = ''
  keys.forEach(e => {
    let v = obj[e]
    if (!v && v !== 0) {
      v = ''
    }
    str += e + '=' + v + '&'
  })
  return str
}
export {appHost, getToken, setToken, getUser, setUser, getPageIndex, setPageIndex, removePageIndex, json2Prams, isDebug}
