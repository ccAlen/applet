// pages/collectionList/collectionList.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagetype: '3',//页面类型，1：章节练习，2：历年真题，3：模拟考试
    navindex: '1',//导航选中序号
    // collectionList:[],
    choiceList:{
      page:{},
      list:[]
    },//选择题所有
    shortList:{
      page: {},
      list: []
    },//非选择题所有
    // recent:'1',//时间段
  },
  urlCollectionList:function(e){
    wx.navigateTo({
      url: '../exercisesCollection/exercisesCollection?collectionid=' + e.currentTarget.dataset.id + '&source=' + this.data.pagetype + '&ischoice=' + this.data.navindex,
    })
    // console.log(e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      pagetype: options.type
    });
    if (options.type == '1') {//章节练习
      wx.setNavigationBarTitle({
        title: '题目收藏-章节练习'
      })
      
      this.getChapterSummary(app.globalData.subjectId, '1','1')
      this.getChapterSummary(app.globalData.subjectId, '0', '1')
    } else if (options.type == '2') {//历年真题
      wx.setNavigationBarTitle({
        title: '题目收藏-历年真题'
      })
      // this.setData({
      //   pagetype: '2'
      // })
      this.getPaperSummary(app.globalData.subjectId, '1', '1')
      this.getPaperSummary(app.globalData.subjectId, '0','1')
    } else {//模拟考试
      wx.setNavigationBarTitle({
        title: '题目收藏-模拟考试'
      })
      // this.setData({
      //   pagetype: '3'
      // })
      this.getMockSummary(app.globalData.subjectId, '1', '1')
      this.getMockSummary(app.globalData.subjectId, '0', '1')
    }
  },
  // 章节练习题目收藏
  // recent:1最近一周，2最近一月，3最近半年
  getChapterSummary: function (subject_id, is_choice,page){
    api.getChapterSummary({      
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          // this.setData({
          //   collectionList: res.data.data,
          // })
          if(is_choice == '1'){//选择题
            var _choiceList = this.data.choiceList;
            _choiceList.page = res.data.page;
            _choiceList.list = _choiceList.list.concat(res.data.data)
            this.setData({
              choiceList: _choiceList
            })
            // console.log(_choiceList)
          }else{//非选择题
            var _shortList = this.data.shortList;
            _shortList.page = res.data.page;
            _shortList.list = _shortList.list.concat(res.data.data)
            this.setData({
              shortList: _shortList
            })
            // console.log(_shortList)
          }
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
        subject_id: subject_id,
        is_choice: is_choice,
        // recent: recent,
        page: page,
        per_page:'5'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 历年真题题目收藏
  getPaperSummary: function (subject_id, is_choice, page){
    api.getPaperSummary({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          // this.setData({
          //   collectionList: res.data.data,
          // })
          if (is_choice == '1') {//选择题
            var _choiceList = this.data.choiceList;
            _choiceList.page = res.data.page;
            _choiceList.list = _choiceList.list.concat(res.data.data)
            this.setData({
              choiceList: _choiceList
            })
            console.log(_choiceList)
          } else {//非选择题
            var _shortList = this.data.shortList;
            _shortList.page = res.data.page;
            _shortList.list = _shortList.list.concat(res.data.data)
            this.setData({
              shortList: _shortList
            })
            console.log(_shortList)
          }
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
        subject_id: subject_id,
        is_choice: is_choice,
        // recent: recent,
        page: page,
        per_page: '5'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试题目收藏
  getMockSummary: function (subject_id, is_choice, page){
    api.getMockSummary({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          // this.setData({
          //   collectionList: res.data.data,
          // })
          if (is_choice == '1') {//选择题
            var _choiceList = this.data.choiceList;
            _choiceList.page = res.data.page;
            _choiceList.list = _choiceList.list.concat(res.data.data)
            this.setData({
              choiceList: _choiceList
            })
            console.log(_choiceList)
          } else {//非选择题
            var _shortList = this.data.shortList;
            _shortList.page = res.data.page;
            _shortList.list = _shortList.list.concat(res.data.data)
            this.setData({
              shortList: _shortList
            })
            console.log(_shortList)
          }
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
        subject_id: subject_id,
        is_choice: is_choice,
        // recent: recent,
        page: page,
        per_page: '5'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  navChange(e) {
    // console.log(e.currentTarget.dataset.nav)
    this.setData({
      navindex: e.currentTarget.dataset.nav
    })
    
    // if ((e.currentTarget.dataset.nav == '2') && (this.data.shortList.list.length <= 0)) {//非选题
    //   if (this.data.pagetype == '1') {//章节
    //     this.getChapterSummary(app.globalData.subjectId, '0', '1')
    //   } else if (this.data.pagetype == '2'){//历年
    //     this.getPaperSummary(app.globalData.subjectId, '0', '1')
    //   } else if (this.data.pagetype == '3'){//模拟
    //     this.getMockSummary(app.globalData.subjectId, '0', '1')
    //   }
      
    // }
  },
  // 选择题更多
  choiceMore:function(){
    if (this.data.pagetype == '1') {//章节
      this.getChapterSummary(app.globalData.subjectId, '1',this.data.choiceList.page.current_page + 1)
    } else if (this.data.pagetype == '2') {//历年
      this.getPaperSummary(app.globalData.subjectId, '1',this.data.choiceList.page.current_page + 1)
    } else if (this.data.pagetype == '3') {//模拟
      this.getMockSummary(app.globalData.subjectId, '1',this.data.choiceList.page.current_page + 1)
    }
    
  },
  // 非选择题更多
  shortMore: function () {
    if (this.data.pagetype == '1') {//章节
      this.getChapterSummary(app.globalData.subjectId, '0', this.data.shortList.page.current_page + 1)
    } else if (this.data.pagetype == '2') {//历年
      this.getPaperSummary(app.globalData.subjectId, '0', this.data.shortList.page.current_page + 1)
    } else if (this.data.pagetype == '3') {//模拟
      this.getMockSummary(app.globalData.subjectId, '0', this.data.shortList.page.current_page + 1)
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})