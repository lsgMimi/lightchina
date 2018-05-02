// pages/light-china/light-china.js
const app = getApp();
var offsetX = 0;
var isPlay = false;
var timer = null;
var currDuration = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    bannerWidth: 0,
    marginClass: 'bless-card-item',
    isCollapse: true,
    isLightAll: false,
    praiseImg: '../../assets/dianliang-1.png',
    audioInfo: {},
    isShowBox: false,
    blessingText: '中国平安',
    blessingAreas: '北京西城',
    lightProvince: [],
    audioSrc: '../../assets/play.png',
    playPercent: 0,
    dlcNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      this.setData({
        userId: decodeURIComponent(options.scene)
      })
    } else if (options.id) {
      this.setData({
        userId: options.id
      });
    }
    this.initialMapAreas();
    app.login(this.initMaps);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.audioCtx = wx.createAudioContext('audios')
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

  collapseBanner: function () {
    var that = this;
    var bannerWidth = that.data.bannerWidth;
    if (!that.data.isCollapse) {
      timer = setInterval(function () {
        bannerWidth = bannerWidth - 30;
        if (bannerWidth < 10) {
          bannerWidth = 0;
          clearInterval(timer);
          that.setData({
            isCollapse: !that.data.isCollapse
          })
        }
        that.setData({
          bannerWidth: bannerWidth
        })
      }, 20);
    } else {
      that.getRandomText();
      timer = setInterval(function() {
        bannerWidth = bannerWidth + 30;
        if (bannerWidth > 600) {
          bannerWidth = 600;
          clearInterval(timer);
          that.setData({
            isCollapse: !that.data.isCollapse
          })
        }
        that.setData({
          bannerWidth: bannerWidth
        })
      }, 20);
    }
  },

  openBanner: function () {
    var that = this;
    var bannerWidth = that.data.bannerWidth;
    if ( that.data.isCollapse) {
      that.getRandomText();
      timer = setInterval(function () {
        bannerWidth = bannerWidth + 30;
        if (bannerWidth > 600) {
          bannerWidth = 600;
          clearInterval(timer);
          that.setData({
            isCollapse: !that.data.isCollapse
          })
        }
        that.setData({
          bannerWidth: bannerWidth
        })
      }, 20);
    } 
  },

  closeBanner: function () {
    var that = this;
    var bannerWidth = that.data.bannerWidth;
    if (!that.data.isCollapse) {
      timer = setInterval(function () {
        bannerWidth = bannerWidth - 30;
        if (bannerWidth < 10) {
          bannerWidth = 0;
          clearInterval(timer);
          that.setData({
            isCollapse: !that.data.isCollapse
          })
        }
        that.setData({
          bannerWidth: bannerWidth
        })
      }, 20);
    }
  },

  /**
   * 获取用户点亮地图信息
   */
  initMaps: function (res) {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    var mapJson = ['BeiJing', 'AnHui', 'FuJian', 'GanSu', 'GuangDong', 'GuangXi', 'GuiZhou', 'HaiNan', 'HeBei', 'HeNan', 'HeiLongJiang', 'HuBei', 'HuNan', 'JiLin', 'JiangSu', 'JiangXi', 'LiaoNing', 'NeiMeng', 'NingXia', 'QingHai', 'ShanDong', 'ShanXi', 'ShaanXi', 'ShangHai', 'SiChuan', 'XiZang', 'XinJiang', 'YunNan', 'ZheJiang', 'TianJin', 'ChongQing', 'XiangGang', 'AoMen', 'TaiWan'];

    app.getRequest(base_url + 'lights-map-percent', {}, function (res) {
      var provinces = res.data;
      that.data.lightProvince = [];
      for (let k in provinces) {
        let opacity = provinces[k];
        if (provinces[k] > 0 && provinces[k] <= 0.333) {
          opacity = 0.25;
        } else if (0.333 < provinces[k] && provinces[k] <= 0.666) {
          opacity = 0.5;
        } else if (0.666 < provinces[k] && provinces[k] < 1) {
          opacity = 0.75;
        }
        var obj = {
          name: mapJson[ k - 1],
          value: provinces[k],
          opacity: opacity,
          key: k
        };
        that.data.lightProvince.push(obj)
      };

      let lightResult = that.data.lightProvince.some(item => {
        return item.value < 1
      });
      if (!lightResult) {
        that.setData({
          isLightAll: true
        })
        const resultCtx = wx.createCanvasContext('resultCanvas');
        wx.downloadFile({
          url: 'https://dlszoss.minishengyi.cn/images/success.png',
          header: {},
          success: function(res) {
            resultCtx.drawImage(res.tempFilePath, 0, 0, 300, 532);
            resultCtx.draw();
          },
          fail: function(res) {},
          complete: function(res) {},
        })
      }
      that.setData({
        lightProvince: that.data.lightProvince
      })
    });
    
    if (that.data.userId) {
      that.initUserBless();
    } else {
      that.getRandomBless();
    }
  },

  initialMapAreas: function () {
    var that = this;
    var mapJson = ['BeiJing', 'AnHui', 'FuJian', 'GanSu', 'GuangDong', 'GuangXi', 'GuiZhou', 'HaiNan', 'HeBei', 'HeNan', 'HeiLongJiang', 'HuBei', 'HuNan', 'JiLin', 'JiangSu', 'JiangXi', 'LiaoNing', 'NeiMeng', 'NingXia', 'QingHai', 'ShanDong', 'ShanXi', 'ShaanXi', 'ShangHai', 'SiChuan', 'XiZang', 'XinJiang', 'YunNan', 'ZheJiang', 'TianJin', 'ChongQing', 'XiangGang', 'AoMen', 'TaiWan'];

    mapJson.map(function(item, index) {
      var obj = {
        name: item,
        value: 0,
        key: index + 1
      };
    });
    that.setData({
      lightProvince: that.data.lightProvince
    })
  },

  /**
   * 获取指定用户祝福
   */
  initUserBless: function () {
    var that = this;
    app.getRequest(app.globalData.BASE_URL +'blessings/users/'+that.data.userId, {},            that.initUserBlessSuccess);
  },

  /**
   * 获取指定用户祝福成功
   */
  initUserBlessSuccess: function (res) {
    this.setData({
      audioInfo: res.data[0]
    })
  },

  /**
   * 随机点亮
   */
  randomLightHandler: function (e) {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    app.postRequest(base_url + 'light-with-likes', {}, function (res) {
      if (res.statusCode == 200) {
        // wx.showToast({
        //   title: '恭喜你！已使用三个赞点亮',
        //   icon: 'success',
        //   duration: 2000,
        //   mask: true,
        //   success: function(res) {

        //   },
        //   fail: function(res) {},
        //   complete: function(res) {},
        // });
        if (res.data.lights.length > 0) {
          wx.showModal({
            title: '成功点亮',
            content: '恭喜你！已使用' + Math.abs(res.data.rewards.likes) + '个赞点亮' + res.data.lights.length+'个城市',
            showCancel: false,
            confirmText: '我知道了',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          });
        } else { 
          wx.showModal({
            title: '祈福神州',
            content: '恭喜你！已经成功点亮中国，祈福神州！',
            showCancel: false,
            confirmText: '我知道了',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          });
        }
      }
    })
  },

  /**
   * 随机获取祝福
   */
  getRandomBless: function (e) {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    app.getRequest(base_url + 'blessings/random', {}, function (res) {
      that.setData({
        praiseImg: '../../assets/dianliang-1.png',
        audioInfo: res.data
      })
    })
  },

  /**
   * 播放音频
   */
  playAudioHandler: function (e) {
    var types = this.data.audioInfo.type;
    this.audioCtx.setSrc(this.data.audioInfo.url);
    if (types == 'audio') {
      if (isPlay) {
        isPlay = false;
        this.audioCtx.pause();
        this.setData({
          audioSrc: '../../assets/play.png'
        })
      } else {
        isPlay = true;
        this.audioCtx.play();
        this.setData({
          audioSrc: '../../assets/pause.png'
        })
      }
      currDuration = this.data.audioInfo.duration ? this.data.audioInfo.duration : 0;
    } else if (types == 'video') {
      wx.navigateTo({
        url: '/pages/play-video/play-video?src=' + this.data.audioInfo.url + '&types="light"&ids=' + this.data.audioInfo.id
      })
    } else if(types == 'image') {
      wx.previewImage({
        current: this.data.audioInfo.url, // 当前显示图片的http链接
        urls: [this.data.audioInfo.url]
      })
      this.playAudioLight();
    }
  },

  /**
   * 给某人点赞
   */
  praiseHandler: function (e) {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    //var userId = app.globalData.userId;
    var userId = that.data.audioInfo.user.id;
    that.setData({
      praiseImg: '../../assets/dianliang-2.png' 
    })
    app.postRequest(base_url + 'users/'+userId+'/like', {}, function (res) {
      
    })
  },

  touchStartHandler: function (e) {
    var x = e.touches[0].clientX;
    offsetX = x;
  },

  touchEndHandler: function (e) {
    var x = e.changedTouches[0].clientX;
    var that = this;
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    offsetX = offsetX - x;
    if (offsetX > 120) {
      offsetX = 0;
      that.setData({
        marginClass: 'bless-card-item bless-card-animation-left'
      })
      that.closeBanner();
      that.getRandomBless();
    } else if (offsetX < -120) {
      offsetX = 0;
      that.setData({
        marginClass: 'bless-card-item bless-card-animation-right'
      });
      that.getRandomBless();
      that.closeBanner();
    }
    setTimeout(function () {
      that.setData({
        marginClass: 'bless-card-item'
      })
    }, 2200);
  },

  /**
   * 处理点亮
   */
  playAudioLight: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    var blessId = that.data.audioInfo.id;
    that.openBanner();
    if (blessId) {
      app.postRequest(base_url + 'blessings/' + blessId + '/accept', {}, function (res) {
        console.log(res)
        var num = res.data.account.dlc;
        var areas = res.data.lights[0].area.parent.name + res.data.lights[0].area.name;
        console.log(areas);
        if(num > 0) {
          that.setData({
            isShowBox: true,
            dlcNum: num,
            blessingAreas: areas
          })
        }
      })
    }
    isPlay = false;
    that.setData({
      audioSrc: '../../assets/play.png'
    })
  },

  hideBox: function () {
    this.setData({
      isShowBox: false
    })
  },

  getRandomText: function () {
    var arr = ['上汽集团',
              '伊利股份',
              '苏宁云商',
              '贵州茅台',
              '广汽集团',
              '人福医药',
              '中兴通讯',
              '比亚迪',
              '上海医药',
              '一汽轿车',
              '泸州老窖',
              '光明乳业',
              '中文传媒',
              '绿地控股',
              '山西汾酒',
              '云南白药',
              '张裕',
              '保利地产',
              '顺鑫农业',
              '福田汽车',
              '老板电器',
              '上港集团',
              '长城汽车',
              '蓝光发展',
              '海澜之家',
              '海天味业',
              '东阿阿胶',
              '泰禾集团',
              '江铃汽车',
              '招商蛇口',
              '新城控股',
              '古井贡酒',
              '九芝堂',
              '金正大',
              '步长制药',
              '老白干酒',
              '江淮汽车',
              '欧派家居',
              '西王食品',
              '金科股份',
              '建发股份',
              '中南建设',
              '尚品宅配',
              '顾家家居',
              '金一文化',
              '金隅股份',
              '以岭药业',
              '中新药业',
              '康恩贝',
              '五粮液',
              '中国联通',
              '青岛啤酒',
              '万科'];
    var index = Math.floor(Math.random() *(53));
    this.setData({
      blessingText: arr[index]
    })
  },

  audioTimeUpdate: function (res) {
    var curr = res.detail.currentTime * 1000;
    if (currDuration) {
      var percent = Math.round((curr / parseInt(currDuration)) * 100);
      if(percent > 94) {
        percent = 100;
      }
      this.setData({
        playPercent: percent
      })
    }
  },

  saveSuccessImage: function () {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 300,
      height: 532,
      destWidth: 0,
      destHeight: 0,
      canvasId: 'resultCanvas',
      fileType: '',
      quality: 0,
      success: function(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showToast({
              title: '分享图保存成功！',
              icon: 'success',
              image: '',
              duration: 2000,
              mask: true,
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })
          },
          fail: function(res) {},
          complete: function(res) {},
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    });
    this.setData({
      isLightAll: false
    })
  },
  hideLightAll: function () {
    this.setData({
      isLightAll: false
    })
  }
})