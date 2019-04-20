// pages/memo/memo.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    state:false,
    isshowSummarybox: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  slideDown: function (e) {
    var t = this;
    t.setData({
      state:!t.data.state
    })
    // var _chapterList = t.data.chapterList;
    // for (var i = 0; i < _chapterList.length; i++) {
    //   if (_chapterList[i].id == e.currentTarget.dataset.id) {
    //     _chapterList[i].state = !(_chapterList[i].state);
    //     t.setData({
    //       chapterList: _chapterList
    //     })
    //   }
    // }

  },
  closeSummarybox: function () {
    this.setData({
      isshowSummarybox: false
    })
  },
  openSummarybox: function () {
    this.setData({
      isshowSummarybox: true
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