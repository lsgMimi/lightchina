// pages/play-video/play-video.js
const app = getApp();
var isLight = false;
var blessId = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoSrc: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.videoContext = wx.createVideoContext('myVideo');
    this.setData({
      'videoSrc': options.src
    });
    this.videoContext.play();
    if(options.types == "light") {
      isLight = true;
      blessId = options.ids;
    }
  
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

  lightHandler: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    console.log(blessId, isLight)
    if (blessId && isLight) {
      app.postRequest(base_url + 'blessings/' + blessId + '/accept', {}, function (res) {
        console.log(res)
      })
    }
  }
})