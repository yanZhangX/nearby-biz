/**
 * @file 打印
 * @author xty(18782271516@163.com)
 */
import { MessageBox } from 'element-ui'

var CreatedOKLodop7766 = null
// var CLodopIsLocal = null
class Print {
  constructor (options, ...dom) {
    console.log(options, ...dom)
  }
  init () {
    // 页面引用CLodop云打印必须的JS文件,用双端口(8000和18000）避免其中某个被占用
    if (this.needCLodop()) {
      var src1 = 'http://localhost:8000/CLodopfuncs.js?priority=1'
      var src2 = 'http://localhost:18000/CLodopfuncs.js?priority=0'
      var head =
        document.head ||
        document.getElementsByTagName('head')[0] ||
        document.documentElement
      var oscript = document.createElement('script')
      oscript.src = src1
      head.insertBefore(oscript, head.firstChild)
      oscript = document.createElement('script')
      oscript.src = src2
      head.insertBefore(oscript, head.firstChild)
      // CLodopIsLocal = !!(src1 + src2).match(/\/\/localho|\/\/127.0.0./i)
    }
  }
  needCLodop () {
    try {
      var ua = navigator.userAgent
      if (ua.match(/Windows\sPhone/i)) {
        return true
      }
      if (ua.match(/iPhone|iPod|iPad/i)) {
        return true
      }
      if (ua.match(/Android/i)) {
        return true
      }
      if (ua.match(/Edge\D?\d+/i)) {
        return true
      }
      var verTrident = ua.match(/Trident\D?\d+/i)
      var verIE = ua.match(/MSIE\D?\d+/i)
      var verOPR = ua.match(/OPR\D?\d+/i)
      var verFF = ua.match(/Firefox\D?\d+/i)
      var x64 = ua.match(/x64/i)
      if (!verTrident && !verIE && x64) {
        return true
      } else if (verFF) {
        verFF = verFF[0].match(/\d+/)
        if (verFF[0] >= 41 || x64) {
          return true
        }
      } else if (verOPR) {
        verOPR = verOPR[0].match(/\d+/)
        if (verOPR[0] >= 32) {
          return true
        }
      } else if (!verTrident && !verIE) {
        var verChrome = ua.match(/Chrome\D?\d+/i)
        if (verChrome) {
          verChrome = verChrome[0].match(/\d+/)
          if (verChrome[0] >= 41) {
            return true
          }
        }
      }
      return false
    } catch (err) {
      return true
    }
  }
  getLodop (oOBJECT, oEMBED) {
    /* var strHtmInstall =
      "<br><font color='#FF00FF'>打印控件未安装!点击这里<a href='install_lodop32.exe' target='_self'>执行安装</a>,安装后请刷新页面或重新进入。</font>"
    var strHtmUpdate =
      "<br><font color='#FF00FF'>打印控件需要升级!点击这里<a href='install_lodop32.exe' target='_self'>执行升级</a>,升级后请重新进入。</font>"
    var strHtm64_Install =
      "<br><font color='#FF00FF'>打印控件未安装!点击这里<a href='install_lodop64.exe' target='_self'>执行安装</a>,安装后请刷新页面或重新进入。</font>"
    var strHtm64_Update =
      "<br><font color='#FF00FF'>打印控件需要升级!点击这里<a href='install_lodop64.exe' target='_self'>执行升级</a>,升级后请重新进入。</font>"
    var strHtmFireFox =
      "<br><br><font color='#FF00FF'>（注意：如曾安装过Lodop旧版附件npActiveXPLugin,请在【工具】->【附加组件】->【扩展】中先卸它）</font>"
    var strHtmChrome =
      "<br><br><font color='#FF00FF'>(如果此前正常，仅因浏览器升级或重安装而出问题，需重新执行以上安装）</font>"
    var strCLodopInstall_1 =
      "<br><font color='#FF00FF'>Web打印服务CLodop未安装启动，点击这里<a href='CLodop_Setup_for_Win32NT.exe' target='_self'>下载执行安装</a>"
    var strCLodopInstall_2 =
      "<br>（若此前已安装过，可<a href='CLodop.protocol:setup' target='_self'>点这里直接再次启动</a>）"
    var strCLodopInstall_3 = "，成功后请刷新本页面。</font>"
    var strCLodopUpdate =
      "<br><font color='#FF00FF'>Web打印服务CLodop需升级!点击这里<a href='CLodop_Setup_for_Win32NT.exe' target='_self'>执行升级</a>,升级后请刷新页面。</font>" */
    var LODOP
    try {
      var ua = navigator.userAgent
      var isIE = !!ua.match(/MSIE/i) || !!ua.match(/Trident/i)
      console.log(this.needCLodop())
      if (this.needCLodop()) {
        try {
          LODOP = window.getCLodop()
          console.log(LODOP)
        } catch (err) {
          console.log(err)
        }
        if (!LODOP && document.readyState !== 'complete') {
          alert('网页还没下载完毕，请稍等一下再操作.')
          return
        }
        if (!LODOP) {
          MessageBox({
            title: '消息',
            message: 'Web打印服务CLodop未安装启动，点击下载安装',
            showCancelButton: true,
            confirmButtonText: '下载',
            cancelButtonText: '取消',
            beforeClose: (action, instance, done) => {
              if (action === 'confirm') {
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '执行中...'
                setTimeout(() => {
                  done()
                  instance.confirmButtonLoading = false
                  this.funDownload('CLodop_Setup_for_Win32NT.exe')
                }, 3000)
              } else {
                done()
              }
            }
          }).then(action => {
            console.log(action)
          })
          // document.body.innerHTML = strCLodopInstall_1 + (CLodopIsLocal ? strCLodopInstall_2 : "") + strCLodopInstall_3 + document.body.innerHTML
          return
        }
        if (window.LODOP.CVERSION < '3.0.9.2') {
          // document.body.innerHTML = strCLodopUpdate + document.body.innerHTML
          console.log('aaa')
        }
        if (oEMBED && oEMBED.parentNode) {
          oEMBED.parentNode.removeChild(oEMBED)
        }
        if (oOBJECT && oOBJECT.parentNode) {
          oOBJECT.parentNode.removeChild(oOBJECT)
        }
      } else {
        // var is64IE = isIE && !!ua.match(/x64/i)

        // =====如果页面有Lodop就直接使用，没有则新建:==========
        if (oOBJECT || oEMBED) {
          if (isIE) {
            LODOP = oOBJECT
          } else {
            LODOP = oEMBED
          }
        } else if (!CreatedOKLodop7766) {
          LODOP = document.createElement('object')
          LODOP.setAttribute('width', 0)
          LODOP.setAttribute('height', 0)
          LODOP.setAttribute(
            'style',
            'position:absoluteleft:0pxtop:-100pxwidth:0pxheight:0px'
          )
          if (isIE) {
            LODOP.setAttribute(
              'classid',
              'clsid:2105C259-1E0C-4534-8141-A753534CB4CA'
            )
          } else {
            LODOP.setAttribute('type', 'application/x-print-lodop')
          }
          document.documentElement.appendChild(LODOP)
          CreatedOKLodop7766 = LODOP
        } else LODOP = CreatedOKLodop7766
        // =====Lodop插件未安装时提示下载地址:==========
        if (!LODOP || !LODOP.VERSION) {
          if (ua.indexOf('Chrome') >= 0) {
            // document.body.innerHTML = strHtmChrome + document.body.innerHTML
          }
          if (ua.indexOf('Firefox') >= 0) {
            // document.body.innerHTML = strHtmFireFox + document.body.innerHTML
          }
          /* document.body.innerHTML =
            (is64IE ? strHtm64_Install : strHtmInstall) +
            document.body.innerHTML */
          return LODOP
        }
      }
      if (LODOP.VERSION < '6.2.2.6') {
        if (!this.needCLodop()) {
          /* document.body.innerHTML =
            (is64IE ? strHtm64_Update : strHtmUpdate) + document.body.innerHTML */
        }
      }
      // ===如下空白位置适合调用统一功能(如注册语句、语言选择等):==
      return LODOP
    } catch (err) {
      alert('getLodop出错:' + err)
    }
  }
  funDownload (url) {
    var eleLink = document.createElement('a')
    eleLink.style.display = 'none'
    eleLink.href = url
    document.body.appendChild(eleLink)
    eleLink.click()
    document.body.removeChild(eleLink)
  }
}
export default Print
