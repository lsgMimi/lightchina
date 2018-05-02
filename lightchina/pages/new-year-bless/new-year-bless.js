// pages/new-year-bless/new-year-bless.js
var recordTimer = null;
const recorderManager = wx.getRecorderManager();
const app = getApp();
var offsetY = 0;
var isUpload = false;
var isLongTap = false;
var blessUrl = "";
var duration = 0;
var currDuration = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordTime: 0,
    recordPercent: 0,
    likesNum: 0,
    blessList: [],
    audioSrc: '',
    playPercent: 0,
    isCurrent: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.login(this.getBlessing);
    // 查询一下用户是否授权了 "scope.record" 这个 scope
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              wx.reLaunch({
                url: 'pages/new-year-bless/new-year-bless',
              })
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    that.audioCtx = wx.createAudioContext('myAudio')
    recorderManager.onStop((res) => {
      const { tempFilePath } = res;
      duration = res.duration;
      if (isUpload) {
        isUpload = false;
        this.getUploadOss(tempFilePath);
      }
      clearInterval(recordTimer);
      this.setData({
        'recordPercent': 0,
        'recordTime': 0
      })
    });
    
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
  onShareAppMessage: function () {
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

  /**
   * 录音
   */
  startRecordHandler: function (e) {
    var that = this;
    offsetY = e.touches[0].clientY;
    that.recordTime();
  
  },
  recordTime: function () {
    var that = this;
    const options = {
      duration: 18000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    }
    isLongTap = true;
    setTimeout(function() {
      if (isLongTap) {
        recorderManager.start(options); 
      }
    }, 500)
    
    recorderManager.onStart(() => {
      recordTimer = setInterval(function () {
        var currRecordTimes = that.data.recordTime + 1;
        if (currRecordTimes > 180) {
          clearInterval(recordTimer);
          isUpload = true;
          recorderManager.stop();
        } else {
          that.setData({
            'recordTime': currRecordTimes,
            'recordPercent': ((currRecordTimes / 180) * 100).toFixed(1)
          })
        }
      }, 100)
    }) 

  },

  endRecordHandler: function (e) {
    var that = this;
    isLongTap = false;
    offsetY = offsetY - e.changedTouches[0].clientY;
    isUpload = true;
    if(offsetY > 100) {
      isUpload = false;
      offsetY = 0;
    }
    recorderManager.stop();
  },

  /**
   * 上传录音文件
   */
  getUploadOss: function (tempFilePath) {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    app.getRequest(base_url + 'oss-upload-options', {}, function (res) {
      if (res.statusCode == 200) {
        const filekey = `${res.data.path}/${res.data.filename}.mp3` // 或.mp4
        const ossHost = res.data.ossHost;
        wx.uploadFile({
          url: res.data.ossHost,
          filePath: tempFilePath,
          name: 'file',
          header: {
            'content-type': 'audio/mp3'
          },
          formData: {
            'key': filekey,
            'policy': res.data.policy,
            'OSSAccessKeyId': res.data.ossKey,
            'signature': res.data.signature,
            'success_action_status': '200',
          },
          success: function (res) {
            console.log(res)
           if(res.statusCode) {
             blessUrl = `${ossHost}/${filekey}`
             that.newBlessing('audio');
           }
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      } 
    });
  },

  /**
   * 新建祝福
   */
  newBlessing: function (types) {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    var data = {
      type: types,
      url: blessUrl,
      duration: duration
    }
    app.postRequest(base_url +'blessings', data, function(res) {
      that.getBlessing();
    })
  },

  /**
   * 获取指定用户的祝福
   */
  getBlessing: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    var userId = app.globalData.userId;

    app.getRequest(base_url + 'blessings/users/' + userId, {}, function (res) {
      console.log(res);
      var lists = res.data;
      lists.forEach(function(list, index) {
        if (list.duration) {
          list.duration = ((list.duration) / 1000).toFixed(2)
        }
        var dates = that.timestampToTime( list.createdAt );
        console.log(dates)
        list.createdAt = dates.slice(2)
        list.isPlay = false;
      }) 
      that.setData({
        blessList: lists
      });
      console.log(that.data.blessList)
    })

    that.getLikeNums();
  },

  /**
   * 时间戳
   */
  timestampToTime: function (timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '/';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
    var D = date.getDate() + ' ';
    return Y+ M + D;
  },

  /**
   * 获得赞数
   */
  getLikeNums: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    // 获取当前用户账户信息
    app.getRequest(base_url + 'account', {}, function (res) {
      if (res.statusCode == 200) {
        that.setData({
          likesNum: res.data.likes
        });
        app.globalData.likesNum = res.data.likes
      }
    });
  },

  /**
   * 上传图片文件
   */
  uploadImgHandler: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempFilePath = res.tempFilePaths;
        app.getRequest(base_url + 'oss-upload-options', {}, function (res) {
          if (res.statusCode == 200) {
            const filekey = `${res.data.path}/${res.data.filename}.png` // 或.mp4
            const ossHost = res.data.ossHost;
            wx.uploadFile({
              url: res.data.ossHost,
              filePath: tempFilePath[0],
              name: 'file',
              header: {
                
              },
              formData: {
                'key': filekey,
                'policy': res.data.policy,
                'OSSAccessKeyId': res.data.ossKey,
                'signature': res.data.signature,
                'success_action_status': '200',
              },
              success: function (res) {
                if (res.statusCode) {
                  blessUrl = `${ossHost}/${filekey}`
                  console.log(blessUrl)
                  that.newBlessing('image');
                }
              },
              fail: function (res) { },
              complete: function (res) { },
            })
          }
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  /**
   * 上传视频文件
   */
  uploadVideoHandler: function () {
    var that = this;
    var base_url = app.globalData.BASE_URL;
    wx.chooseVideo({
      maxDuration: 20,
      success: function(res) {
        var tempFilePath = res.tempFilePath;
        var size = res.size;
        duration = res.duration;
        console.log(res.duration, res.size)
        if(size > 10485760) {
          app.showErrorMsg('出现错误啦！', '上传的视频不能超过10M')
          return;
        }
        if(duration > 20) {
          app.showErrorMsg('出现错误啦！', '上传的视频不能超过20s')
          return;
        }
        duration = duration * 1000;
        app.getRequest(base_url + 'oss-upload-options', {}, function (res) {
          if (res.statusCode == 200) {
            const filekey = `${res.data.path}/${res.data.filename}.mp4` // 或.mp4
            const ossHost = res.data.ossHost;
            wx.uploadFile({
              url: res.data.ossHost,
              filePath: tempFilePath,
              name: 'file',
              header: {
                'content-type': 'video/mp4'
              },
              formData: {
                'key': filekey,
                'policy': res.data.policy,
                'OSSAccessKeyId': res.data.ossKey,
                'signature': res.data.signature,
                'success_action_status': '200',
              },
              success: function (res) {
                if (res.statusCode) {
                  blessUrl = `${ossHost}/${filekey}`
                  console.log(blessUrl)
                  that.newBlessing('video');
                }
              },
              fail: function (res) { },
              complete: function (res) { },
            })
          }
        });

      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  /**
   * 音频进度条绘制
   */
  initialCircle: function (id, percent) {
    var cxt_arc = wx.createCanvasContext(id);//创建并返回绘图上下文context对象。  
    cxt_arc.setLineWidth(3);
    cxt_arc.setStrokeStyle('#cccccc');
    cxt_arc.setLineCap('round')
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(22, 22, 15, 0, 2 * Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径  
    cxt_arc.stroke();//对当前路径进行描边  

    cxt_arc.setLineWidth(3);
    cxt_arc.setStrokeStyle('#ffffff');
    cxt_arc.setLineCap('round')
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(22, 22, 15, 0, Math.PI * percent, false);
    cxt_arc.stroke();//对当前路径进行描边  

    cxt_arc.draw();

  },

  playAudioHandler: function (e) {
    var list = this.data.blessList;
    var index = e.currentTarget.dataset.index;
    var types = list[index].type;
    list.forEach((item) => {
      item.isPlay = false;
    });
    if (types == 'video') {
      wx.navigateTo({
        url: '/pages/play-video/play-video?src=' + list[index].url + '&types="preview"'
      })
    } else if (types == 'audio') {
      if (this.data.isCurrent < 0) {
        this.audioCtx.setSrc(list[index].url);
        this.audioCtx.play();
        list[index].isPlay = true;
        this.setData({
          'isCurrent': index,
          'blessList': list
        })
      } else {
        if (this.data.isCurrent == index) {
          this.audioCtx.pause();
          this.audioCtx.seek(0);
          list[index].isPlay = false;
          this.setData({
            playPercent: 0,
            isCurrent: -1,
            blessList: list
          })
        } else {
          this.audioCtx.pause();
          this.audioCtx.seek(0);
          this.audioCtx.setSrc(list[index].url);
          this.audioCtx.play();
          list[index].isPlay = true;
          this.setData({
            'isCurrent': index,
            'blessList': list
          })
        }
      }
      currDuration = list[index].duration ? list[index].duration : 0
    } else if (types == 'image') {
      wx.previewImage({
        current: list[index].url, // 当前显示图片的http链接
        urls: [list[index].url] 
      })
    }
  },

  audioTimeUpdate: function (res) {
    var curr = res.detail.currentTime;
    if (currDuration) {
      var percent = Math.round( ( curr / currDuration ) * 100);
      if(percent > 96) {
        percent = 100;
      }
      this.setData({
        playPercent: percent
      })
    }
  },
  audioEndHandler: function () {
    var that = this;
    that.data.blessList.forEach((item) => {
      item.isPlay = false;
    });
    that.setData({
      playPercent: 100,
    })
    setTimeout(function() {
      that.setData({
        blessList: that.data.blessList,
        playPercent: 0
      })
    }, 500)
  }
})