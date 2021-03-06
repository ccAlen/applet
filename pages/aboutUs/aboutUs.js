// pages/aboutUs/aboutUs.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    aboutus:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getaboutus({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          if(res.data.code == '200'){
            this.setData({
              aboutus: res.data.data
            })
            console.log(res)
          }else{
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 2000
            })
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
      data: {},
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