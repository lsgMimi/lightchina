// pages/wallet/wallet.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dlc: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initWallet();
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
  
  initWallet: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    // 获取当前用户账户信息
    app.getRequest(base_url + 'account', {}, function (res) {
      that.setData({
        dlc: res.data.dlc
      });
    });
  }
})