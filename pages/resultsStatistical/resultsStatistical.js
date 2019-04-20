// pages/resultsStatistical/resultsStatistical.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    testType:'1',
    chapterCard:{},//章节练习答题卡信息
    h1isshow: false,
    chioseRecordInfo:{},//做题记录进来，选择的记录信息
    //控制progress
    count: 0, // 设置 计数器 初始为0
    countTimer: null,// 设置 定时器
    progress_txt: 50,// 提示文字
    // isshowselect: false,
    result:{},
    sheetList:{},
    paperInfo:{},
    record_id:'',
    navindex:'',
    isstudydata:false
  },
  slideDown: function (e) {
    this.setData({
      h1isshow: !this.data.h1isshow
    })
  },
  urlBack:function(){
    console.log(this.data.isstudydata)
    if (this.data.isstudydata){
      wx.reLaunch({
        url: '../studyData/studyData'
      })
    }else{
      wx.reLaunch({
        url: '../index/index'
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    // console.log(app.globalData.isstudydata)
    var t = this;
    t.setData({
      testType: app.globalData.testType,
      record_id: options.record_id,
      navindex: options.navindex ? options.navindex : '',
      isstudydata: app.globalData.isstudydata
    })
    if (options.issheet){//从答题卡进来该页面
      if (app.globalData.testType == '1'){//章节练习
        
        var _total = app.globalData.chaptercardInfo.total;
        var _correct = app.globalData.chaptercardInfo.correct;
        var _progress_txt = parseFloat(_correct / (_total == '0' ? '1' : _total)).toFixed(1) * 100;
        t.setData({
          paperInfo: app.globalData.chapterInfo,
          chapterCard: app.globalData.chaptercardInfo,
          progress_txt: _progress_txt
        })
        //参数在0——60之间，60为一圈
        t.startProgress(parseFloat(_progress_txt) / 100 * 60);

        console.log(app.globalData.chaptercardInfo)
      } else if (app.globalData.testType == '2'){//历年真题
        t.getPaperresult(options.record_id);
        t.setData({
          paperInfo: app.globalData.paperInfo
        })
      } else if (app.globalData.testType == '3'){//模拟考试
        t.getTestpaperresult(options.record_id);
        t.setData({
          paperInfo: app.globalData.paperInfo
        })
      }
      
      wx.getStorage({
        key: 'sheetList',
        success(res) {
          console.log(res.data)
          t.setData({
            sheetList: res.data
          })
        }
      })
    }else{//从成绩记录进来该页面
    
      const _chioseRecordInfo = app.globalData.chioseRecordInfo;
      if (_chioseRecordInfo) {
        var _progress_txt = parseFloat(_chioseRecordInfo.correct / (_chioseRecordInfo.paper.question_number == '0' ? '1' : _chioseRecordInfo.paper.question_number)).toFixed(1) * 100;
        //参数在0——60之间，60为一圈
        t.startProgress(parseFloat(_progress_txt) / 100 * 60);
        t.setData({
          chioseRecordInfo: _chioseRecordInfo,
          progress_txt: _progress_txt
        })
        console.log(_chioseRecordInfo)
        if (app.globalData.testType == '2') {//历年真题
          t.getPapersheet(_chioseRecordInfo.paper_id, _chioseRecordInfo.id)
        } else if (app.globalData.testType == '3') {//模拟考试
          t.getTestpapersheet(_chioseRecordInfo.paper_id, _chioseRecordInfo.id)
        }
      }
      
      if (app.globalData.testType == '2'){//历年真题
        t.getPaperresult(options.record_id);
      } else if (app.globalData.testType == '3'){//模拟考试
        t.getTestpaperresult(options.record_id);
      }
    }
    
    
    // t.getPapersheetdone(options.record_id);
    // 学习进度环形图
    //绘制背景
    t.drawProgressbg();
    //开始progress
    //参数在0——60之间，60为一圈
    // t.startProgress(parseFloat(t.data.progress_txt) / 100 * 60);
  },
  
  // 历年真题获取试卷结果
  getPaperresult: function(record_id){
    api.getPaperresult({
      success: (result) => {
        if (api.status.Reg.test(result.statusCode)) {
          var _progress_txt = parseFloat(result.data.data.correct / (result.data.data.paper.question_number == '0' ? '1' : result.data.data.paper.question_number)).toFixed(2) * 100;
          this.setData({
            result: result.data.data,
            progress_txt: _progress_txt
          })
          //参数在0——60之间，60为一圈
          this.startProgress(parseFloat(_progress_txt) / 100 * 60);
          console.log(_progress_txt)
        } else {
          wx.showToast({
            title: result.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "GET",
      data: {
        record_id: record_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试获取试卷结果
  getTestpaperresult:function(record_id){
    api.getTestpaperresult({
      success: (result) => {
        if (api.status.Reg.test(result.statusCode)) {
          var _progress_txt = parseFloat(result.data.data.correct / (result.data.data.paper.question_number == '0' ? '1' : result.data.data.paper.question_number)).toFixed(2) * 100;
          this.setData({
            result: result.data.data,
            progress_txt: _progress_txt
          })
          //参数在0——60之间，60为一圈
          this.startProgress(parseFloat(_progress_txt) / 100 * 60);
          console.log(result)
        } else {
          wx.showToast({
            title: result.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "GET",
      data: {
        record_id: record_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 获取历年真题试卷答题卡
  getPapersheet: function (paper_id, record_id) {
    api.getPapersheet({
      success: (sheet) => {
        if (api.status.Reg.test(sheet.statusCode)) {
          var _sheet = sheet.data.data;
          if (_sheet.choice.length > 0) {
            for (var i = 0; i < _sheet.choice.length; i++) {
              // _sheet.choice[i] = { id: _sheet.choice[i] },
              _sheet.choice[i].haddone = '0'
            }
          }
          if (_sheet.question.length > 0) {
            for (var i = 0; i < _sheet.question.length; i++) {
              // _sheet.question[i] = { id: _sheet.question[i] },
              _sheet.question[i].haddone = '0'
            }
          }
          this.setData({
            sheetList: _sheet
          })

          // 获取试卷答题卡
          api.getPapersheetdone({
            success: (res) => {
              if (api.status.Reg.test(res.statusCode)) {
                console.log(res)
                var _card = res.data.data;
                if (_sheet.choice.length > 0) {
                  for (var j = 0; j < _sheet.choice.length; j++) {
                    for (var row in _card) {
                      if (row == _sheet.choice[j].id) {
                        _sheet.choice[j].haddone = '1',
                          _sheet.choice[j].isCorrect = _card[row].correct
                      }
                    }
                  }
                }
                if (_sheet.question.length > 0) {
                  for (var j = 0; j < _sheet.question.length; j++) {
                    for (var row in _card) {
                      if (row == _sheet.question[j].id) {
                        _sheet.question[j].haddone = '1',
                          _sheet.question[j].isCorrect = _card[row]
                      }
                    }
                  }
                }
                // if (_card.length > 0){
                // for (var i = 0; i < _sheet.length; i ++){
                //   for (var _id in _card){
                //     if (_id == _sheet[i].id){
                //       console.log(_id)
                //       _sheet[i].haddone = '1';
                //       _sheet[i].isCorrect = _card[_id].correct;
                //     }
                //   }
                // }
                // }
                this.setData({
                  sheetList: _sheet
                })
                console.log(_sheet)
              } else {
                wx.showToast({
                  title: res.message,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            method: "GET",
            data: {
              record_id: record_id
            },
            header: {
              'content-type': 'application/json',
              'Authorization': 'Bearer ' + app.globalData.token
            },
          })
        } else {
          wx.showToast({
            title: sheet.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "GET",
      data: {
        paper_id: paper_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试答题卡
  getTestpapersheet: function (paper_id, record_id) {
    api.getTestpapersheet({
      success: (sheet) => {
        if (api.status.Reg.test(sheet.statusCode)) {
          var _sheet = sheet.data.data;
          if (_sheet.choice.length > 0) {
            for (var i = 0; i < _sheet.choice.length; i++) {
              // _sheet.choice[i] = { id: _sheet.choice[i] },
              _sheet.choice[i].haddone = '0'
            }
          }
          if (_sheet.question.length > 0) {
            for (var i = 0; i < _sheet.question.length; i++) {
              // _sheet.question[i] = { id: _sheet.question[i] },
              _sheet.question[i].haddone = '0'
            }
          }
          this.setData({
            sheetList: _sheet
          })

          // 获取试卷答题卡
          api.getTestpapersheetdone({
            success: (res) => {
              if (api.status.Reg.test(res.statusCode)) {
                console.log(res)
                var _card = res.data.data;
                if (_sheet.choice.length > 0) {
                  for (var j = 0; j < _sheet.choice.length; j++) {
                    for (var row in _card) {
                      if (row == _sheet.choice[j].question_id) {
                        _sheet.choice[j].haddone = '1',
                          _sheet.choice[j].isCorrect = _card[row].correct
                      }
                    }
                  }
                }
                if (_sheet.question.length > 0) {
                  for (var j = 0; j < _sheet.question.length; j++) {
                    for (var row in _card) {
                      if (row == _sheet.question[j].id) {
                        _sheet.question[j].haddone = '1',
                          _sheet.question[j].isCorrect = _card[row]
                      }
                    }
                  }
                }
                this.setData({
                  sheetList: _sheet
                })
                console.log(_sheet)
              } else {
                wx.showToast({
                  title: res.message,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            method: "GET",
            data: {
              record_id: record_id
            },
            header: {
              'content-type': 'application/json',
              'Authorization': 'Bearer ' + app.globalData.token
            },
          })
        } else {
          wx.showToast({
            title: sheet.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "GET",
      data: {
        paper_id: paper_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
  * 画progress底部背景
  */
  drawProgressbg: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext('canvasProgressbg')
    // 设置圆环的宽度
    ctx.setLineWidth(5);
    // 设置圆环的颜色
    ctx.setStrokeStyle('#efefef');
    // 设置圆环端点的形状
    ctx.setLineCap('round')
    //开始一个新的路径
    ctx.beginPath();
    //设置一个原点(60,60)，半径为100的圆的路径到当前路径
    ctx.arc(82.5, 82.5, 65, 0, 2 * Math.PI, false);
    //对当前路径进行描边
    ctx.stroke();
    //开始绘制
    ctx.draw();
  },

  /**
   * 画progress进度
   */
  drawCircle: function (step) {
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('canvasProgress');
    // 设置圆环的宽度
    context.setLineWidth(15);
    // 设置圆环的颜色
    context.setStrokeStyle('#ffa005');
    // const grd = context.createLinearGradient(0, 0, 200, 0)
    // grd.addColorStop(0, 'red')
    // grd.addColorStop(1, 'white')
    // context.setFillStyle(grd)
    
    // 设置圆环端点的形状
    context.setLineCap('round')
    //开始一个新的路径
    context.beginPath();
    //参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(82.5, 82.5, 65, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    //对当前路径进行描边
    context.stroke();
    //开始绘制
    context.draw()
  },

  /**
   * 开始progress
   */
  startProgress: function (per) {
    this.setData({
      count: 0
    });
    // 设置倒计时 定时器 每100毫秒执行一次，计数器count+1 ,耗时6秒绘一圈
    this.countTimer = setInterval(() => {
      if (this.data.count <= per) {
        /* 绘制彩色圆环进度条  
        注意此处 传参 step 取值范围是0到2，
        所以 计数器 最大值 60 对应 2 做处理，计数器count=60的时候step=2
        */
        this.drawCircle(this.data.count / (60 / 2))
        this.data.count++;
      } else {
        clearInterval(this.countTimer);
        // this.startProgress();
      }
    }, 20)
  },
  urlexerciseswrong:function(e){
    if (e.currentTarget.dataset.onlyerror == '1'){//错题解析，判断有没有错题
      var _sheetList = this.data.sheetList.choice;
      var haserror = false;
      for (var i = 0; i < _sheetList.length; i++){
        if (_sheetList[i].isCorrect == '0'){
          haserror = true;
         
        }
      }
      if (haserror) {
        wx.navigateTo({
          url: '../exerciseswrong/exerciseswrong?record_id=' + this.data.record_id + '&only_error=' + e.currentTarget.dataset.onlyerror + '&navindex=' + (this.data.navindex || this.data.testType) + '&date=' + (this.data.result.finish_date || this.data.chioseRecordInfo.finish_date),
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '没有错题哟~',
          showCancel: false,
          success(res) {
            if (res.confirm) {
            }
          }
        })
      }
    }else{
      wx.navigateTo({
        url: '../exerciseswrong/exerciseswrong?record_id=' + this.data.record_id + '&only_error=' + e.currentTarget.dataset.onlyerror + '&navindex=' + (this.data.navindex || this.data.testType) + '&date=' + (this.data.result.finish_date || this.data.chioseRecordInfo.finish_date),
      })
    }
    
  }
})