// pages/light-records/light-records.js
const app =getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    provinceList: [],
    isCurrent: 0,
    scrollTop: 0,
    currentCity: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProvinceInfo();
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

  getProvinceInfo: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    app.getRequest(base_url+'areas', {}, function(res){
      var areas = res.data;
      var provinceList = []
      areas.map(function (area, index) {
        var obj = area;
        obj.children = [];
        if (!area.parent) {
          provinceList.push(obj);
        }
      })
      provinceList.map(function (item, i) {
        areas.map(function (area, j) {
          if (area.parent) {
            if (item.id == area.parent) {
              item.children.push(area);
            }
          }
        })
      });
      provinceList[29].children.push({
        id: 29,
        name: '天津'
      });
      provinceList[30].children.push({
        id: 30,
        name: '重庆'
      });
      provinceList[31].children.push({
        id: 31,
        name: '香港'
      });
      provinceList[32].children.push({
        id: 32,
        name: '澳门'
      });
      provinceList[33].children.push({
        id: 33,
        name: '台湾'
      });
      that.setData({
        provinceList: provinceList,
        currentCity: provinceList[0].children
      });
      that.getLightsRecord(1)
    })
  },
  provinceTabHandler: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var currentCityList = that.data.provinceList[index].children;
    that.setData({
      isCurrent: index,
      currentCity: currentCityList
    });
    that.getLightsRecord(id);
  },
  getLightsRecord: function (id) {
    var that = this;
    var url = '';
    if (29 < id && id < 35) {
      url = app.globalData.BASE_URL + 'lights';
    } else {
      url = app.globalData.BASE_URL + 'lights?parentAreaId=' + id;
    }
    app.getRequest(url, {}, that.getLightsRecordSuccess);
  },
  getLightsRecordSuccess: function (res) {
    var that = this;
    if (res.data.length > 0) {
      that.data.currentCity.forEach((item) => {
        res.data.forEach((lightItem) => {
          if (lightItem.area.id == item.id) {
            item.avatar = lightItem.lightUser.avatarUrl || '../../assets/dianliang-2.png';
          }
        })
      })
      that.setData({
        currentCity: that.data.currentCity
      });
    }
  }
})