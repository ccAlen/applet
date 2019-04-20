//index.js
//获取应用实例
const app = getApp()
const api = require('../../api/api.js');

const wrapText = function(context, text, x, y, maxWidth, lineHeight) {
  if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
    return;
  }

  // 字符分隔为数组
  var arrText = text.split('');
  var line = '';

  for (var n = 0; n < arrText.length; n++) {
    var testLine = line + arrText[n];
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = arrText[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

Page({
  data: {
    reportInfo: {
      answer_total: '**',
      cost_days: '**',
      cost_time: '**',
      max_total: '**',
      rank_rate: '**',
      right_number: '**',
      right_rate: '**'
    }, //报告信息
    showgetphone: true,
    getreport: false, //首次进入是否获取数据报告弹框
    sharebox: false, //分享助力弹框
    isshowboom: false, //是否显示弹框
    list: [],
    animationData: {},
    startX: 0,
    endX: 0,
    pointposition: {
      x: 0,
      y: 0
    },
    sanresults: {
      x: 0,
      y: 0
    },
    setting: {},
    freepaper: {},
    islevelpaper: false,
    levelpaperlist: [], //分享解锁的水平测试试卷列表
    paper_id: '',
    userInfo: {},
    tipstxt:[]
  },
  onShow: function() {
    var t = this;
    
    t.getanswerrecord(app.globalData.subjectId)
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        if (res.data.mobile) {
          t.setData({
            showgetphone: false
          })
          t.getreport(app.globalData.subjectId)
          t.getradarmap(app.globalData.subjectId)
        } else {
          t.setData({
            showgetphone: true
          })
        }
        t.setData({
          userInfo: res.data
        })
      },
      fail() {
        api.getUserInfo({
          success: (res) => {
            if (api.status.Reg.test(res.statusCode)) {
              t.setData({
                userInfo: res.data.data
              })
              if (!res.data.data.mobile) {
                t.setData({
                  showgetphone: true
                })
              } else {
                t.setData({
                  showgetphone: false
                })
                t.getreport(app.globalData.subjectId)
                t.getradarmap(app.globalData.subjectId)
              }
              wx.setStorage({
                key: 'userInfo',
                data: res.data.data
              })
              app.globalData.userInfo = res.data.data;
              console.log(res)
            } else {
              wx.showToast({
                title: res.message,
                icon: 'none',
                duration: 2000
              })
            }
          },
          method: "GET",
          data: {},
          header: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + app.globalData.token
          },
        })
      }
    })
  },
  onPullDownRefresh() {
    var t = this;
    t.getlevelpaperid(app.globalData.subjectId)
    t.getanswerrecord(app.globalData.subjectId)
    
  },
  onLoad: function(options) {
    var t = this;
    t.getlevelpaperid(app.globalData.subjectId)
    // t.getanswerrecord(app.globalData.subjectId)
    // 分享设置
    wx.showShareMenu({
      withShareTicket: true
    })
    // t.hexagon({
    //   element: 'firstCanvas',
    //   x: 150,
    //   y: 150,
    //   maxR: 80,
    //   color: '#ffd86c',
    //   width: '0.8',
    //   arc: [{
    //     r: '80'
    //   }, {
    //     r: '60'
    //   }, {
    //     r: '40'
    //   }, {
    //     r: '20'
    //   }],
    //   standard: ["要求理解的知识点", "要求识记的知识点", "要求了解的知识点", "要求掌握的知识点", "要求运用的知识点"],
    //   results: [0,0,0,0,0], //结果数据在0-4之间
    //   bgcolor: ['#fff7cf', '#ffe59e', '#ffd157', '#ff9900']
    // });
  },
  cancalFun: function() {
    this.setData({
      getreport: false
    })
  },
  closeFun: function() {
    this.setData({
      sharebox: false
    })
  },
  // 获取随机出卷接口
  makepaper: function (subject_id, form_id){
    api.makepaper({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          if (res.data.code == '813') {
            this.getanswerrecord(app.globalData.subjectId)
          }else{
            // wx.hideToast()
            // wx.hideLoading()
            // wx.showToast({
            //   title: res.data.message,
            //   icon: 'none',
            //   duration: 2000
            // })
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success(res) {
                if (res.confirm) {
                }
              }
            })
          }
        } else {
          wx.showToast({
            title: '数据报错',
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: {
        subject_id: subject_id,
        form_id: form_id
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
      // isshowLoading: true
    })
  },
  sjcjFun: function(e) {
    console.log(e)
    const {
      levelpaperlist,
      freepaper
    } = this.data;
    console.log(levelpaperlist)
    console.log(freepaper)

    if (freepaper.paper_id == '0') {
      wx.showToast({
        title: '暂时没有模拟测试卷可做',
        icon: 'none',
        duration: 2000
      })
    } else if (freepaper.record_id != '0' && (freepaper.finish_date && freepaper.finish_date != 'null')) { //非第一次进来，且免费题已经做完，不显示免费试卷，生成随机水平测试卷
      this.makepaper(app.globalData.subjectId, e.detail.formId)
      // console.log("123")
      // console.log(freepaper.record_id)
      // if (levelpaperlist.length == 0){
      //   this.makepaper(app.globalData.subjectId, e.detail.formId)
      // }else{
      //   for (var i = 0; i < levelpaperlist.length; i++) {
      //     if (levelpaperlist[i].is_unlock == '0') {
      //       wx.showToast({
      //         title: '您的' + levelpaperlist[i].paper_name + '(' + levelpaperlist[i].paper_no + ')' + '还未完成哦',
      //         icon: 'none',
      //         duration: 2000
      //       })
      //       return false;
      //     } else {
      //       break;
      //       this.makepaper(app.globalData.subjectId, e.detail.formId)
      //     }
      //   }
      // }
    } else { //第一次进来，做免费题
      console.log("free")

      this.setData({
        islevelpaper: false,
        isshowboom: true
      })
    }

  },
  hideBoom: function() {
    this.setData({
      isshowboom: false
    })
  },
  unLockFun: function(e) {
    this.unlockpaper(app.globalData.subjectId, e.currentTarget.dataset.id)
    this.setData({
      sharebox: true,
      paper_id: e.currentTarget.dataset.id
    })
  },
  // 获取用户信息
  getPhoneNumber: function(e) {
    var t = this;

    wx.login({
      success: function(res) {
        if (res.code) {
          if (e.detail.iv) { //允许获取手机号 
            // 获取用户手机
            api.getmobile({
              success: (phoneNum) => {
                if (api.status.Reg.test(phoneNum.statusCode)) {
                  // console.log(phoneNum.data.data)
                  const _userInfo = t.data.userInfo;
                  // console.log(_userInfo)
                  _userInfo.mobile = phoneNum.data.data.mobile;
                  wx.setStorage({
                    key: 'userInfo',
                    data: _userInfo
                  })
                  // 获取到手机号后，请求更新用户信息接口存储手机号
                  api.updateUserInfo({
                    success: (update) => {
                      if (api.status.Reg.test(update.statusCode)) {
                        // console.log(update)
                        // 更新手机号成功，获取学习数据
                        t.setData({
                          showgetphone: false
                        })
                        t.getreport(app.globalData.subjectId)
                        t.getradarmap(app.globalData.subjectId)
                      } else {
                        wx.showToast({
                          title: update.message,
                          icon: 'none',
                          duration: 2000
                        })
                      }
                    },
                    data: {
                      mobile: phoneNum.data.data.mobile
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/json',
                      'Authorization': 'Bearer ' + app.globalData.token
                    },
                  })
                } else {
                  wx.showToast({
                    title: phoneNum.message,
                    icon: 'none',
                    duration: 2000
                  })
                }
              },
              data: {
                code: res.code,
                iv: e.detail.iv,
                encryptedData: e.detail.encryptedData
              },
              method: 'POST',
              header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + app.globalData.token
              },
            })

          } else { //拒绝获取手机号
            console.log("拒绝授权手机号")

          }
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
  },
  // 分享
  onShareAppMessage: function(res) {
    var t = this;
    console.log(t.data.userInfo.id)
    const {
      setting,
      paper_id
    } = this.data;
    return {
      title: setting.title,
      path: '/pages/index/index?paper_id=' + paper_id + '&subject_id=' + app.globalData.subjectId + '&user_id=' + t.data.userInfo.id,
      imageUrl: setting.coverimage,
      success: (res) => { // 成功后要做的事情
        wx.showShareMenu({
          // 要求小程序返回分享目标信息
          withShareTicket: true
        });
        if (res.shareTickets) {
          // 获取转发详细信息
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success(res) {
              console.log("成功助力用户信息")
              console.log(res)
            },
            fail() {
              console.log("失败助力用户信息")
              console.log(res)
            },
            complete() {}
          });
        }
      },
      fail: function(res) {
        // 分享失败
        console.log(res)
      }
      // success(e) {
      //   wx.showToast({
      //     title: '分享成功',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // },
      // fail(e) {
      //   wx.showToast({
      //     title: '分享失败',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
    }
  },
  onReady: function(e) {

  },
  hexagon: function(config) {
    var context = wx.createCanvasContext(config.element);

    var x = config.x; //圆心的x坐标
    var y = config.y; //圆心的y坐标
    var maxR = config.maxR; //最大半径
    var standard = config.standard; //标准线
    var angle = 360 / standard.length * 2 * Math.PI / 360;
    context.setStrokeStyle(config.color || '#000000');
    context.setLineWidth(config.width || '1');
    var arc = config.arc || [];
    // context.translate(0,0)
    context.rotate(-18 * Math.PI / 180);
    context.translate(-38, 25)
    //绘制六边形
    // console.log(arc);
    for (let i = 0; i < arc.length; i++) {
      context.beginPath();
      let r = arc[i].r;
      context.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      for (let i = 1; i < standard.length; i++) {
        context.lineTo(x + r * Math.cos(angle * (i + 1)), y + r * Math.sin(angle * (i + 1)));
      }
      // console.log(config.bgcolor[i])
      context.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      // context.setFillStyle(config.bgcolor[i])
      // context.fill()
      context.setFillStyle(config.bgcolor[i])
      context.fill()
      if (i == 0) {
        context.setStrokeStyle('#ffd86c')
        context.stroke()
      }
    }
    //绘制标准线
    context.beginPath();
    context.setLineWidth(1)
    context.setStrokeStyle('#ffd86c')
    for (let i = 0; i < standard.length; i++) {
      context.moveTo(x, y);
      let lineX = x + maxR * Math.cos(angle * (i + 1));
      let lineY = y + maxR * Math.sin(angle * (i + 1));
      context.lineTo(lineX, lineY);
    }
    context.stroke();
    // 绘制结果图
    let poinarr = []
    context.beginPath();
    context.setStrokeStyle('#fc4a14')
    // context.setStrokeStyle('#000')
    context.setLineWidth(1.5)
    context.setGlobalAlpha(1)
    for (let i = 0; i < config.results.length; i++) {
      let r = 80 * (config.results[i] / 4);
      let pointx = x + r * Math.cos(angle * (i + 1));
      let pointy = y + r * Math.sin(angle * (i + 1));
      context.beginPath()

      let poin = {};
      poin.x = pointx;
      poin.y = pointy;
      poinarr.push(poin)
    }
    for (let j = 0; j < poinarr.length + 1; j++) {
      if (j == 0) {
        context.moveTo(poinarr[0].x, poinarr[0].y)
      } else if (j > (poinarr.length - 1)) {
        context.lineTo(poinarr[0].x, poinarr[0].y)
      } else {
        context.lineTo(poinarr[j].x, poinarr[j].y)
      }
    }
    context.stroke();


    //绘制文字
    context.rotate(18 * Math.PI / 180);
    context.setFillStyle('#333')
    context.translate(40, -60)
    context.setTextAlign('center')
    for (let i = 0; i < standard.length; i++) {
      let lineX = x + (maxR + 30) * Math.cos(angle * (i + 1));
      let lineY = y + (maxR + 30) * Math.sin(angle * (i + 1));
      if (lineX < x) {
        // wrapText(context, standard[i], lineX - 30, lineY, 100 )
        // context.fillText(standard[i], lineX, lineY);
        wrapText(context, standard[i], lineX, lineY, 40, 16)
      } else {
        wrapText(context, standard[i], lineX, lineY, 40, 16)
        // context.fillText(standard[i], lineX, lineY);
      }
    }


    // context.rotate(20 * Math.PI / 180);
    context.draw();
  },
  // 获取学习报告
  getreport: function(subject_id) {
    api.getreport({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(parseFloat(res.data.data.right_rate) * 100)
          // console.log(parseFloat(res.data.data.answer_total) / 1400 * 100)
          // console.log(res.data.data.answer_total)
          this.setData({
            reportInfo: res.data.data,
            sanresults: {
              x: res.data.data.right_rate,
              y: res.data.data.answer_total
            },
            pointposition: {
              // x: parseFloat(res.data.data.right_rate) - 2.5,
              x: parseFloat(res.data.data.right_rate) * 100 - 2.5,
              y: parseFloat(res.data.data.answer_total) / 1400 * 100
              // y: parseFloat(2500) / 1400 * 100 //测试
            }
          })
        } else {
          wx.showToast({
            title: '数据报错',
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: {
        subject_id: subject_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 获取雷达图数据
  getradarmap: function(subject_id) {
    api.getradarmap({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {

          var _resule = res.data.data;
          var _rate = [];
          var row = [3, 2, 1, 5, 4]
          for (var a in row) {
            // console.log(row[a])
            _rate.push(_resule[row[a]].rate / 100 * 4)
          } 

          this.hexagon({
            element: 'firstCanvas',
            x: 100,
            y: 100,
            maxR: 80,
            color: '#ffd86c',
            width: '0.8',
            arc: [{
              r: '80'
            }, {
              r: '60'
            }, {
              r: '40'
            }, {
              r: '20'
            }],
            standard: ["", "", "", "", ""],
            // standard: ["要求理解的知识点", "要求识记的知识点", "要求了解的知识点", "要求掌握的知识点", "要求运用的知识点"],
            results: _rate, //结果数据在0-4之间
            bgcolor: ['#fff7cf', '#ffe59e', '#ffd157', '#ff9900']
          });
          // 获取最小的两个值
          var arr = JSON.parse(JSON.stringify(_rate));

          arr.sort(function (a, b) {
            return a - b;
          }); 
          var minarr = arr.slice(0, 2);
          var _tipstxt = [];
          for (var i = 0; i < _rate.length; i++){
            for (var j = 0; j < minarr.length; j++) {
              if (minarr[j] == _rate[i]){
                _tipstxt.push(i)
              }
            }
          }
          // console.log(_tipstxt)
          this.setData({
            tipstxt: _tipstxt.slice(0, 2)
          })
          // console.log(_rate)
          // console.log(arr)
          // console.log(minarr)
        } else {
          wx.showToast({
            title: '数据报错',
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: {
        subject_id: subject_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 解锁试卷
  unlockpaper: function(subject_id, paper_id) {
    api.unlockpaper({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          this.setData({
            setting: res.data.data
          })
          if (res.data.data.need_number == res.data.data.helped_number){
            this.getanswerrecord(app.globalData.subjectId)
          }
        } else {
          wx.showToast({
            title: '数据报错',
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: {
        subject_id: subject_id,
        paper_id: paper_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 获取水平测试卷id
  getlevelpaperid: function(subject_id) {
    api.getlevelpaperid({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          wx.stopPullDownRefresh();
          var _freepaper = res.data.data;
          app.globalData.testType = '3';
          this.setData({
            freepaper: _freepaper
          })
          if (_freepaper.paper_id == '0') {
            this.setData({
              islevelpaper: true
            })
            // wx.showToast({
            //   title: '暂时没有模拟测试卷可做',
            //   icon: 'none',
            //   duration: 2000
            // })
          } else if (_freepaper.finish_date && ((_freepaper.finish_date != null) || (_freepaper.finish_date != ''))) { //非第一次进来，生成随机水平测试卷
            this.setData({
              islevelpaper: true
            })

          } else { //第一次进来，做模拟试卷里的题
            this.setData({
              islevelpaper: false
            })
            // wx.navigateTo({
            //   url: '../exercisesPaper/exercisesPaper?id=' + _freepaper.paper_id + '&count=' + _freepaper.question_number,
            // })
          }
        } else {
          wx.showToast({
            title: '数据报错',
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: {
        subject_id: subject_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  urlexercisesPaper: function() {
    const {
      freepaper
    } = this.data;
    app.globalData.testType = '3';
    app.globalData.isstudydata = true;
    app.globalData.paperInfo = {
      count: freepaper.question_number,
      id: freepaper.paper_id,
      name: freepaper.paper_name
    }
    wx.navigateTo({
      url: '../exercisesPaper/exercisesPaper?id=' + freepaper.paper_id + '&count=' + freepaper.question_number + '&levelpapername=' + freepaper.paper_name,
    })
  },
  getlevelpaperFun: function() {
    this.urlexercisesPaper()
  },
  gotolevelexercises: function(e) {
    app.globalData.isstudydata = true;
    wx.navigateTo({
      url: '../exercisesLevelPaper/exercisesLevelPaper?levelpaperinfo=' + JSON.stringify(e.currentTarget.dataset),
    })
  },
  // 获取答卷记录
  getanswerrecord: function(subject_id) {
    api.getanswerrecord({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          this.setData({
            levelpaperlist: res.data.data
          })
          wx.stopPullDownRefresh();
        } else {
          wx.showToast({
            title: '数据报错',
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: {
        subject_id: subject_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
        
})