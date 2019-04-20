// pages/sheet/sheet.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showbox:false,
    sheetList:[],
    paperInfo:{},//试卷的信息
    chapterInfo:{},//章节练习信息
    ispaper: false,//是否历年真题进来
    record_id:'',//历年真题的答卷记录id
    levelsheetList: [],//水平测试答题卷
    islevelpaper: false,//是否水平测试答题卷
    levelpapertitle:'',
    testType: '1', //首页选择的练习类型，1：章节练习，2：历年真题，3：模拟考试,4:要点详情里面的例题
  },
  urlresultsStatistical:function(){
    if (this.data.islevelpaper) {//水平测试卷进来
      app.globalData.isstudydata = true;
      wx.reLaunch({
        url: '../levelresult/levelresult?issheet=true' + '&paperid=' + this.data.paper_id + '&papername=' + this.data.levelpapertitle,
      })
      wx.setStorage({
        key: 'sheetList',
        data: this.data.levelsheetList
      })
    }else{
      // app.globalData.isstudydata = false;
      wx.reLaunch({
        url: '../resultsStatistical/resultsStatistical?record_id=' + this.data.record_id + '&issheet=true',
      })
      wx.setStorage({
        key: 'sheetList',
        data: this.data.sheetList
      })
    }
    
  },
  theirPapersFun:function(){
    var alldone = true;
    // console.log(this.data.sheetList)
    if (this.data.islevelpaper){//水平测试卷进来
      var _sheetList = this.data.levelsheetList;
      // console.log(_sheetList)
      for (var i = 0; i < _sheetList.length; i++) {
        if (_sheetList[i].answer == null) {
          alldone = false;
        }
      }
    }else{
      var _sheetList = this.data.sheetList;
      // console.log(_sheetList)
      for (var i = 0; i < _sheetList.choice.length; i++) {
        if (_sheetList.choice[i].haddone == '0') {
          alldone = false;
        }
      }
      for (var i = 0; i < _sheetList.question.length; i++){
        if (_sheetList.question[i].haddone == '0') {
          alldone = false;
        }
      }
    }
    
    if (alldone){//做完所有题目，直接跳转
      // /levelresult/levelresult
      if (this.data.islevelpaper) {//水平测试卷进来
        app.globalData.isstudydata = true;
        wx.reLaunch({
          url: '../levelresult/levelresult?issheet=true' + '&paperid=' + this.data.paper_id + '&papername=' + this.data.levelpapertitle,
        })
        wx.setStorage({
          key: 'sheetList',
          data: this.data.levelsheetList
        })
      }else{
        // app.globalData.isstudydata = false;
        wx.reLaunch({
          url: '../resultsStatistical/resultsStatistical?record_id=' + this.data.record_id + '&issheet=true',
        })
        wx.setStorage({
          key: 'sheetList',
          data: this.data.sheetList
        })
      }
      
    }else{//没做完所有题目
      this.setData({
        showbox: true
      })
    }
  },
  cancalFun:function(){
    this.setData({
      showbox: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var t= this;
    console.log(options)
    t.setData({
      testType: app.globalData.testType,
    })
    if (options.chapterid){//章节练习的答题卡
      t.getSheet(options.chapterid)
      t.setData({
        chapterInfo: app.globalData.chapterInfo
      })
      // console.log(app.globalData.chapterInfo)
    } else if (options.paperid){
      // console.log(app.globalData.paperInfo)
      
      t.setData({
        ispaper:true,
        record_id: options.record_id,
        paperInfo: app.globalData.paperInfo
      })
      if (app.globalData.testType == '2') {//历年真题的答题卡
        t.getPapersheet(options.paperid, options.record_id)
      } else if (app.globalData.testType == '3'){//模拟考试
        t.getTestpapersheet(options.paperid, options.record_id)
      }
    } else if (options.levelpaperid){//水平测试
      // const _sheetList = app.globalData.levelPaperList;
      api.levelpapergetsheet({
        success: (res) => {
          if (api.status.Reg.test(res.statusCode)) {
            const _ananswersheet = res.data.data;
            console.log(_ananswersheet)
            this.setData({
              levelsheetList: _ananswersheet,
              islevelpaper:true,
              ispaper:true,
              levelpapertitle: options.papername,
              paper_id: options.levelpaperid
            })
            // if (_sheetList.length > 0) {
            //   for (var j = 0; j < _sheetList.length; j++) {
            //     for (var row in _ananswersheet) {
            //       if (row == _sheetList.id) {
            //         _sheetList[j].haddone = '1',
            //         _sheetList[j].isCorrect = _ananswersheet.choice[row]
            //       }
            //     }
            //   }
            //   var _sheet = this.data.sheetList;
            //   _sheet.choice = _sheetList;
            //   t.setData({
            //     sheetList: _sheet
            //   })
            // }
          } else {
            wx.showToast({
              title: '数据报错',
              icon: 'none',
              duration: 2000
            })
          }
        },
        data: {
          paper_id: options.levelpaperid
        },
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + app.globalData.token
        },
      })
      
    }
    
  },
  // 获取章节练习答题卡
  getSheet:function(_id){
    api.getSheet({
      success: (sheet) => {
        if (api.status.Reg.test(sheet.statusCode)) {
          var _sheet = sheet.data.data;
          if (_sheet.choice.length > 0) {
            for (var i = 0; i < _sheet.choice.length; i++) {
              _sheet.choice[i] = { id: _sheet.choice[i] },
                _sheet.choice[i].haddone = '0'
            }
          }
          if (_sheet.question.length > 0) {
            for (var i = 0; i < _sheet.question.length; i++) {
              _sheet.question[i] = { id: _sheet.question[i] },
                _sheet.question[i].haddone = '0'
            }
          }
          this.setData({
            sheetList: _sheet
          })
          // console.log(_sheet)

          api.getAnswersheet({
            success: (answersheet) => {
              if (api.status.Reg.test(answersheet.statusCode)) {
                var _ananswersheet = answersheet.data.data;
                app.globalData.chaptercardInfo = _ananswersheet;
                if (_sheet.choice.length > 0) {
                  for (var j = 0; j < _sheet.choice.length; j++) {
                    for (var row in _ananswersheet.choice) {
                      if (row == _sheet.choice[j].id) {
                        _sheet.choice[j].haddone = '1',
                          _sheet.choice[j].isCorrect = _ananswersheet.choice[row]
                      }
                    }
                  }
                }
                if (_sheet.question.length > 0) {
                  for (var j = 0; j < _sheet.question.length; j++) {
                    for (var row in _ananswersheet.question) {
                      if (row == _sheet.question[j].id) {
                        _sheet.question[j].haddone = '1',
                          _sheet.question[j].isCorrect = _ananswersheet.question[row]
                      }
                    }
                  }
                }
                this.setData({
                  sheetList: _sheet
                })
                // console.log(_sheet)
              } else {
                wx.showToast({
                  title: answersheet.message,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            method: "GET",
            data: {
              chapter_id: _id,//章id
              only_wrong:'0'
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
        chapter_id: _id,//章id
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
                      if (row == _sheet.question[j].question_id) {
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
  onShareAppMessage: function () {

  }
})