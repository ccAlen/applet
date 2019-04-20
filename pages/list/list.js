// pages/list/list.js 
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isshowbox:false,
    listType:'',//列表类型
    subject_id: '',//	科目id
    chapterList:[],//章节练习列表
    count:{},//各章节试题数量
    answer: {},//各章答题数据
    title:'',
    remaining:'',//剩余没做题量
    oldPaperList:[],//历年真题列表
    // oldPaperListNum:{},//历年真题答题数据
    selectPaper:{},//所点击的试卷信息
    testPaperList:[],//模拟考试列表

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    var t = this;
    app.globalData.testType = options.type;
    t.setData({
      listType: options.type,
      subject_id:options.subject_id
    })
    if(options.type == '1'){//章节练习列表
      t.getChapterList(options.subject_id)
      t.setData({
        title: options.subjectName
      })
      wx.setNavigationBarTitle({
        title: '章节练习'//页面标题为路由参数
      })
    } else if (options.type == '2') {//历年真题列表
      t.getPapers(options.subject_id,'1')
      t.setData({
        title: '历年真题列表'
      })
      wx.setNavigationBarTitle({
        title: '历年真题'//页面标题为路由参数
      })
    } else if (options.type == '3') {//模拟考试列表
      t.setData({
        title: '模拟考试试卷列表'
      })
      wx.setNavigationBarTitle({
        title: '模拟考试'//页面标题为路由参数
      })
      t.getTestPapers(options.subject_id,'1')
    }
  },
  // 统计各章答题数据
  getAnswercountList: function (_subject_id, _chapterList){
    var t = this;
    var chapterList = _chapterList;
    // 获取各章节试题数量
    api.getCount({
      success: (_count) => {
        if (api.status.Reg.test(_count.statusCode)) {
          var countList = _count.data.data;
          for (var i = 0; i < chapterList.length; i++) {
            for (var row in countList) {
              if (chapterList[i].id == row) {
                chapterList[i].count = countList[row];
              }
            }
          }
          t.setData({
            count: countList,
            chapterList: chapterList
          })
          
        } else {
          wx.showToast({
            title: _count.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "GET",
      data: {
        subject_id: _subject_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
    // 统计各章答题数据
    api.getAnswercount({
      success: (_answer) => {
        if (api.status.Reg.test(_answer.statusCode)) {
          // console.log(_answer)
          var answerlist = _answer.data.data;
          
          for (var i = 0; i < chapterList.length; i++){
            for (var row in answerlist) {
              if (chapterList[i].id == row){
                chapterList[i].completed_number = answerlist[row].completed_number;
                chapterList[i].correct_number = answerlist[row].correct_number;
              }
            }
          }
          
          t.setData({
            answer: answerlist,
            chapterList: chapterList
          })
          // console.log(chapterList)
        } else {
          wx.showToast({
            title: _answer.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "GET",
      data: {
        subject_id: _subject_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 课程学习--章节列表
  getChapterList: function (_subject_id){
    // 章节列表
    api.getChapterList({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          const _chapterList = res.data.data;
          for(var i = 0; i < _chapterList.length; i++){
            _chapterList[i].completed_number = 0;
            _chapterList[i].count = 0;
            _chapterList[i].correct_number = 0;
          }
          this.setData({
            chapterList: _chapterList
          })
          this.getAnswercountList(_subject_id, _chapterList)
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
        subject_id: _subject_id,
        only_chapter:'1'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 历年真题
  getPapers: function (_subject_id,page){
    api.getPapers({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _oldPaperList = res.data.data;
          for (var i = 0; i < _oldPaperList.length; i++){
            _oldPaperList[i].correct_number = 0;
            _oldPaperList[i].completed_number = 0;
          }
          this.setData({
            oldPaperList: _oldPaperList
          })
          // 历年真题的答题数据
          api.getNewestpapers({
            success: (num) => {
              if (api.status.Reg.test(num.statusCode)) {
                console.log(num)
                var _oldPaperList = res.data.data;
                var _oldPaperListNum = num.data.data;
                for (var op in _oldPaperListNum){
                  for (var i = 0; i < _oldPaperList.length; i++){
                    if (op == _oldPaperList[i].id){
                      _oldPaperList[i].completed_number = _oldPaperListNum[op].completed;
                      _oldPaperList[i].correct_number = _oldPaperListNum[op].correct;
                      _oldPaperList[i].is_done = _oldPaperListNum[op].is_done;
                      _oldPaperList[i].record_id = _oldPaperListNum[op].id;
                    }
                  }
                  
                }
                this.setData({
                  oldPaperList: _oldPaperList
                })
              } else {
                wx.showToast({
                  title: num.message,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            method: "GET",
            data: {
              subject_id: _subject_id
            },
            header: {
              'content-type': 'application/json',
              'Authorization': 'Bearer ' + app.globalData.token
            },
          })
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
        subject_id: _subject_id,
        page: page,
        per_page:'1000'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试
  getTestPapers: function (_subject_id, page){
    api.getTestPapers({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _testPaperList = res.data.data;
          for (var i = 0; i < _testPaperList.length; i++) {
            _testPaperList[i].correct_number = 0;
            _testPaperList[i].completed_number = 0;
          }
          this.setData({
            testPaperList: res.data.data
          })
          // 模拟考试做题数据
          api.getTestnews({
            success: (num) => {
              if (api.status.Reg.test(num.statusCode)) {
                console.log(num)
                
                var _testPaperListNum = num.data.data;
                for (var op in _testPaperListNum) {
                  for (var i = 0; i < _testPaperList.length; i++) {
                    if (op == _testPaperList[i].id) {
                      _testPaperList[i].completed_number = _testPaperListNum[op].completed;
                      _testPaperList[i].correct_number = _testPaperListNum[op].correct;
                      _testPaperList[i].is_done = _testPaperListNum[op].is_done;
                      _testPaperList[i].record_id = _testPaperListNum[op].id;
                    }
                  }

                }
                this.setData({
                  testPaperList: _testPaperList
                })
                console.log(_testPaperList)
              } else {
                wx.showToast({
                  title: num.message,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            method: "GET",
            data: {
              subject_id: _subject_id
            },
            header: {
              'content-type': 'application/json',
              'Authorization': 'Bearer ' + app.globalData.token
            },
          })
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
        subject_id: _subject_id,
        page: page,
        per_page: '1000'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  goStart:function(e){
    if (this.data.listType == '1'){//章节练习点进来，直接跳转到题目
      console.log(e)
      console.log(12)
      for (var i = 0; i < this.data.chapterList.length; i++){
        if (this.data.chapterList[i].id == e.currentTarget.dataset.id){
          var _count = parseInt(this.data.chapterList[i].count) - parseInt(this.data.chapterList[i].completed_number)
          if (_count <= 0){
            wx.showModal({
              title: '提示',
              content: '没有可做的题目了',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                }
              }
            })
          }else{
            wx.navigateTo({
              url: '../exercises/exercises?chapter_id=' + e.currentTarget.dataset.id + '&count=' + _count,
            })
            app.globalData.chapterInfo = e.currentTarget.dataset;
          }
          
        }
      }
      
    }else{
      console.log(e)
      var _count = e.currentTarget.dataset.count;
      if (_count <= 0) {
        wx.showModal({
          title: '提示',
          content: '没有可做的题目了',
          showCancel: false,
          success(res) {
            if (res.confirm) {
            }
          }
        })
      } else {
        var _selectpaper = this.data.selectPaper;
        _selectpaper.id = e.currentTarget.dataset.id;
        _selectpaper.name = e.currentTarget.dataset.name;
        _selectpaper.remark = e.currentTarget.dataset.remark;
        _selectpaper.count = e.currentTarget.dataset.count;
        this.setData({
          isshowbox: true,
          selectPaper: _selectpaper
        })
      }
    }
  },
  cancalFun: function () {
    this.setData({
      isshowbox: false
    })
  },
  urlExercises:function(){
    console.log(this.data.selectPaper);
    app.globalData.paperInfo = this.data.selectPaper;
    wx.navigateTo({
      // url: '../exercisesPaper/exercisesPaper?id=' + this.data.selectPaper.id + '&count=' + this.data.selectPaper.question_number,
      url: '../exercisesPaper/exercisesPaper?id=' + this.data.selectPaper.id + '&count=' + this.data.selectPaper.count,
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