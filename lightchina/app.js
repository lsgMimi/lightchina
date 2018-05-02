//app.js
//const BASE_URL = 'https://minishengyi.cn/lightchina/api/v1/';

App({
  onLaunch: function () {
    //this.login(this.loginSuccess);
  },
  login: function (success) {
    let that = this;
    wx.login({
      success: function(res) {
        var code = res.code;
        wx.getUserInfo({
          withCredentials: true,
          lang: '',
          success: function(res) {
            var encryptedData = res.encryptedData;
            var iv = res.iv;
            var signature = res.signature;
            var rawData = res.rawData;
            that.globalData.userInfo = res.userInfo;
            try {
              let token = wx.getStorageSync('token');
              let userId = wx.getStorageSync('userId');
              let qrcode = wx.getStorageSync('qrcode');
              if (token && userId) {
                that.globalData.token = token;
                that.globalData.userId = userId;
                that.globalData.qrcode = qrcode;
                typeof success == 'function' && success(res);
              } else {
                wx.request({
                  url: that.globalData.BASE_URL + 'login',
                  data: {
                    encryptedData: encryptedData,
                    iv: iv,
                    code: code,
                    rawData: rawData,
                    userInfo: res.userInfo,
                    signature: signature
                  },
                  header: {
                    'content-type': 'application/json;charset=utf-8'
                  },
                  method: 'post',
                  success: function (res) {
                    if (res.statusCode == 200) {
                      that.globalData.token = res.data.token;
                      wx.setStorage({
                        key: 'token',
                        data: res.data.token
                      })
                      that.getRequest(that.globalData.BASE_URL +'profile', {}, function(res) {
                        that.globalData.userId = res.data.id;
                        that.globalData.qrcode = res.data.qrcode;
                        wx.setStorage({
                          key: 'qrcode',
                          data: res.data.qrcode
                        })
                        wx.setStorage({
                          key: 'userId',
                          data: res.data.id
                        })
                      })
                      typeof success == 'function' && success(res)
                    } else {
                      that.showErrorMsg('出现错误啦！', res.data.errMsg);
                    }
                    
                  },
                  fail: function (res) {

                  },
                  complete: function (res) { },
                })
              }
            }catch(e) {

            }
          },
          fail: function (res) {
            wx.showModal({
              title: '没有授权的话，无法使用服务！',
              content: '您可以进行授权，或者删除重新进入小程序！',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  if (wx.openSetting) {
                    wx.openSetting({
                      success: function (res) {
                        console.log(res)
                      },
                      fail: function (res) { },
                      complete: function (res) { },
                    })
                  }
                }
              },
              fail: function (res) { },
              complete: function (res) { },
            })
          },
          complete: function (res) {

          },
        })
      }
    })
  },
  globalData: {
    userInfo: {},
    userId: '',
    qrcode: '',
    token: '',
    likesNum: 0,
    BASE_URL: 'https://minishengyi.cn/lightchina/api/v1/'
  },
  
  /**
   * 错误信息提示
   */
  showErrorMsg: function(title, content) {
    wx.showModal({
      title: title,
      content: content ? content : '',
      showCancel: false,
      confirmText: '我知道了',
    
    })
  },
  /**
   * get请求
   */
  getRequest: function(url, data, success, fail, complete) {
    let that = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: url,
      data: data,
      method: 'get',
      header: {
        'Authorization': 'Bearer ' + that.globalData.token
      },
      success: function (res) {
        if (res.statusCode == 401) {
          wx.removeStorageSync('token');
          that.globalData.token = '';
          wx.removeStorageSync('userId');
          that.globalData.userId = '';
          wx.reLaunch({
            url: '/pages/index/index'
          })
        } else if (res.statusCode == 200) {
          typeof success == 'function' && success(res)
        } else {
         that.showErrorMsg('出现错误啦！', res.data.errMsg);
        }
      },
      fail: function(res) {
        typeof fail == 'function' && fail(res)
      },
      complete: function(res) {
        typeof complete == 'function' && complete(res)
        wx.hideNavigationBarLoading();
      },
    })
   
  },
  /**
   * post请求
   */
  postRequest: function (url, data, success, fail, complete) {
    let that = this;
    wx.showNavigationBarLoading();

    wx.request({
      url: url,
      data: data,
      method: 'post',
      header: {
        'content-type': 'application/json;charset=utf-8',
        'Authorization': 'Bearer ' + that.globalData.token
      },
      success: function (res) {
        if (res.statusCode == 401) {
          wx.removeStorageSync('token');
          that.globalData.token = '';
          wx.removeStorageSync('userId');
          that.globalData.userId = '';
          wx.reLaunch({
            url: '/pages/index/index'
          })
        } else if (res.statusCode == 200) {
          typeof success == 'function' && success(res)
        } else {
          that.showErrorMsg('出现错误啦！', res.data.errMsg);
        }
      },
      fail: function (res) {
        typeof fail == 'function' && fail(res)
      },
      complete: function (res) {
        typeof complete == 'function' && complete(res)
        wx.hideNavigationBarLoading();
      },
    })

  }
})