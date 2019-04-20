// pages/sharingPower/sharingPower.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    helprecord:{},
    shareInfo:{},
    helpsuccess: false,
    helpedpaper:{}
  },
  urlIndex:function(){
    wx.reLaunch({
      url: '../index/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var t = this;
    const shareInfo = JSON.parse(options.option);
    t.setData({
      shareInfo: shareInfo
    })
    console.log(shareInfo)
    t.gethelpedpaper(shareInfo.paper_id)
    t.getList(shareInfo.subject_id, shareInfo.paper_id, shareInfo.user_id)
  },
  // 助力榜单
  getList: function (subject_id, paper_id, user_id){
    var t = this;
    api.gethelprecord({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          t.setData({
            helprecord: res.data.data
          })
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
      data: {
        subject_id: subject_id,
        paper_id: paper_id,
        user_id: user_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  helpFun:function(){
    const { shareInfo } = this.data;
    if (app.globalData.token == '') {
      wx.login({
        success(_code) {
          // console.log(res)
          if (_code.code) {
            // 发起网络请求
            // t.getLogin({ code: res.code })
            // 调用接口
            api.getAuthorization({
              success: (res) => {
                if (api.status.Reg.test(res.statusCode)) {
                  console.log(res)
                  if (res.data.data && res.data.data.token) {
                    app.globalData.token = res.data.data.token;
                    wx.setStorageSync('token', res.data.data.token)
                    t.setData({
                      token: res.data.data.token
                    })
                   
                  } else {
                    wx.reLaunch({
                      url: '../authorization/authorization',
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
              data: { code: _code.code },
              header: { 'content-type': 'application/json' },
            });
          } else {
            wx.showToast({
              title: '登录失败！' + res.errMsg,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    } else {
      api.recordhelp({
        success: (res) => {
          if (api.status.Reg.test(res.statusCode)) {
            console.log(res)
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 2000
            })
            if(res.data.code == '801'){
              this.setData({
                helpsuccess:true
              })
              this.getList(this.data.shareInfo.subject_id, this.data.shareInfo.paper_id, this.data.shareInfo.user_id)
            }
          } else {
            wx.showToast({
              title: '数据报错',
              icon: 'none',
              duration: 2000
            })
          }
        },
        data: shareInfo,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + app.globalData.token
        },
      })
    }
  },
  // 获取助力试卷信息
  gethelpedpaper:function(paper_id){
    api.gethelpedpaper({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          this.setData({
            helpedpaper:res.data.data
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
        paper_id: paper_id
      },
      method: 'GET',
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