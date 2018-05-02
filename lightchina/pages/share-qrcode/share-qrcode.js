// pages/share-qrcode/share-qrcode.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowBox: false,
    avatarUrl: '../../assets/fu.jpg',
    userName: '嘿嘿',
    qrcode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.login(this.loginSuccess);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  shareHandler: function () {
    var that = this;
    that.setData({
      'isShowBox': true
    })
    var ctx = wx.createCanvasContext('qrcodeCanvas');
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, 274, 394);
    ctx.save();
    ctx.drawImage('../../assets/share.jpg', 0, 0, 274, 274);
    ctx.save();
    var avatarUrlTemplate = ''
    that.downloadFile(that.data.avatarUrl, function(avatar){
      avatarUrlTemplate = avatar.tempFilePath;
      that.downloadFile(that.data.qrcode, function(qrcode){
        ctx.drawImage(avatarUrlTemplate, 25, 291, 32, 32);
        ctx.save();
        
        ctx.setFillStyle('#6A7785')
        ctx.setFontSize(13)
        ctx.fillText(that.data.userName, 67, 312);
        ctx.save();
        ctx.drawImage(qrcode.tempFilePath, 155, 291, 90, 90);
        ctx.save();
        ctx.drawImage('../../assets/text.png', 25, 335, 120, 45);
        ctx.save();
        ctx.draw();
      })
    });
   
  },
  downloadFile: function (url, success) {
    wx.downloadFile({
      url: url,
      header: {},
      success: function(res) {
        typeof success == 'function' && success(res)
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  saveImgHandler: function () {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 274,
      height: 394,
      destWidth: 548,
      destHeight: 788,
      canvasId: 'qrcodeCanvas',
      success: function (res) {
        console.log(res.tempFilePath);
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showToast({
              title: '分享图保存成功！',
              icon: 'success',
              image: '',
              duration: 2000,
              mask: true,
              success: function(res) {},
              fail: function(res) {},
              complete: function(res) {},
            })
          },
          fail: function(res) {},
          complete: function(res) {
           
          },
        })
      }
    });
    that.setData({
      'isShowBox': false
    })
  },

  loginSuccess: function () {
    var that = this;
    that.setData({
      userName: app.globalData.userInfo.nickName,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      qrcode: app.globalData.qrcode
    });
    console.log(app.globalData.qrcode)
  },

  closeShareBox: function () {
    this.setData({
      isShowBox: false
    })
  }
})