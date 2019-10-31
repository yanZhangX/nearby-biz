import _ from 'lodash'
const appHost = function () {
  // return 'https://api-biz.lianlianlvyou.com'
  // return 'http://192.168.10.126:9999'
  // return 'http://192.168.10.211:9999'
  // return 'http://192.168.11.248:8080'
  // return 'http://192.168.1.175:9999'
  // return 'http://192.168.10.77:8082'
  return 'http://192.168.10.129:8080'
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
    let v = ''
    if (!_.isNil(obj[e])) {
      v = obj[e]
    }
    str += e + '=' + v + '&'
  })
  return str
}
export {appHost, getToken, setToken, getUser, setUser, getPageIndex, setPageIndex, removePageIndex, json2Prams}
