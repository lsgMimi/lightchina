//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    provinces: 0,
    blessingCount: 0,
    count: 0,
    lightCount: 0,
    likes: 0,
    userName: '',
    avatarUrl: '',
    scene: '',
    cities: 0
  },
  onLoad: function (options) {
    // if (options.scene) {
    //   this.setData({
    //     scene: decodeURIComponent(options.scene)
    //   })
    // }
  },

  onShow: function () {
    // if (this.data.scene) {
    //   wx.navigateTo({
    //     url: '/pages/light-china/light-china?id='+this.data.scene,
    //     success: function(res) {},
    //     fail: function(res) {},
    //     complete: function(res) {},
    //   })
    // } else {
    //   app.login(this.loginSuccess);
    // }
    app.login(this.loginSuccess);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '亲们，我录了一段新年祝福给你们，扫码收听帮我点亮祝福地图吧',
      path: '/pages/light-china/light-china?id=' + app.globalData.userId,
      imageUrl: '../../assets/share.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  initialPages: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    // 获取当前用户点亮数量
    app.getRequest(base_url + 'lights-count', {}, function (res) {
      if (res.statusCode == 200) {
        that.setData({
          provinces: res.data.provinces,
          cities: res.data.cities
        })
      }
    });
    // 获取用户和祝福总数
    app.getRequest(base_url + 'global-count', {}, function (res) {
      if (res.statusCode == 200) {
        that.setData({
          blessingCount: res.data.blessingsCount,
          lightCount: res.data.usersCount
        })
      }
    });
    // 获取当前用户账户信息
    app.getRequest(base_url + 'account', {}, function (res) {
      if (res.statusCode == 200) {
        that.setData({
          likes: res.data.likes
        });
        app.globalData.likesNum = res.data.likes
      }
    });

    app.getRequest(base_url + 'accepts-count', {}, function (res) {
      if (res.statusCode == 200) {
        var count = res.data.count;
        that.setData({
          count: count
        });
      }
    });
  },
  
  loginSuccess: function () {
    var that = this;
    that.setData({
      userName: app.globalData.userInfo.nickName,
      avatarUrl: app.globalData.userInfo.avatarUrl
    });
    wx.authorize({
      scope: 'scope.record',
    })
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
    })
    that.initialPages();
  },

  sharePages: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})
