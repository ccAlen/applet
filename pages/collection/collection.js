// pages/collection/collection.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var t = this;
    t.getCollectionsummary(app.globalData.subjectId)
  },
  urlCollectionList:function(e){
    app.globalData.testType = e.currentTarget.dataset.type;
    if (e.currentTarget.dataset.count == 0) {
      var _text;
      if (e.currentTarget.dataset.type == '1') {
        _text = '你的章节练习暂时还没有收藏喔~'
      } else if (e.currentTarget.dataset.type == '2') {
        _text = '你的历年真题暂时还没有收藏喔~'
      } else {
        _text = '你的模拟考试暂时还没有收藏喔~'
      }
      wx.showModal({
        title: '提示',
        content: _text,
        showCancel: false,
        success(res) {
          if (res.confirm) {
            // console.log('用户点击确定')
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../collectionList/collectionList?type=' + e.currentTarget.dataset.type,
      })
    }
  },
  // 获取错题统计概览
  getCollectionsummary: function (_subject_id) {
    api.getCollectionSummary({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _summary = res.data.data;
          // console.log(_summary)
          this.setData({
            summary: _summary
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
        subject_id: _subject_id
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