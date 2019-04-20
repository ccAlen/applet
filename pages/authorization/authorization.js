// pages/authorization/authorization.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad() {
    
  },
  bindGetUserInfo(e) {
    var t = this;
    if(e.detail.iv){
      console.log("用户已授权")
      console.log(e)
      app.globalData.userInfo = e.userInfo;
      wx.login({
        success(res) {
          console.log(res)
          if (res.code) {
            // 发起网络请求
            t.getLogin({ code: res.code, encryptedData: e.detail.encryptedData, iv: e.detail.iv })
          } else {
            wx.showToast({
              title: '登录失败！' + res.errMsg,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }else{
      console.log("用户没有授权")
    }
  },
  getLogin:function(per){
    // 调用接口
    api.getAuthorization({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          if (res.data.data && res.data.data.token){
            app.globalData.token = res.data.data.token;
            wx.setStorageSync('token', res.data.data.token)
            wx.reLaunch({
              url: '../typeSelection/typeSelection',
            })
          }
        }else{
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: per,
      header: { 'content-type': 'application/json' },
    });
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