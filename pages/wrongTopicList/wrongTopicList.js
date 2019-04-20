// pages/wrongTopicList/wrongTopicList.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wrongList:[],
    pagetype:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pagetype: options.type
    });
    if(options.type == '1'){//章节练习
      wx.setNavigationBarTitle({
        title: '错题本-章节练习'
      })
      
      this.getexercisewrong(app.globalData.subjectId)
    }else if(options.type == '2'){//历年真题
      wx.setNavigationBarTitle({
        title: '错题本-历年真题'
      })
      this.getpaperwrong(app.globalData.subjectId)
    }else{//模拟考试
      wx.setNavigationBarTitle({
        title: '错题本-模拟考试'
      })
      this.getmockwrong(app.globalData.subjectId)
    }
  },
  // 获取章节练习错误章节列表
  getexercisewrong: function (subject_id){
    api.getexercisewrong({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          this.setData({
            wrongList:res.data.data
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
        subject_id: subject_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 获取历年真题错误试卷列表
  getpaperwrong:function(subject_id){
    api.getpaperwrong({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          this.setData({
            wrongList: res.data.data
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
        subject_id: subject_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
// 获取模拟考试错误试卷列表
  getmockwrong:function(subject_id){
    api.getmockwrong({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          this.setData({
            wrongList: res.data.data
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
        subject_id: subject_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  
  goStart:function(e){
    // console.log(e)
    wx.navigateTo({
      url: '../exercises/exercises?wrongid=' + e.currentTarget.dataset.id + '&wrongtype=' + this.data.pagetype + '&recordid=' + e.currentTarget.dataset.recordid,
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