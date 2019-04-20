// pages/center/center.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isshowgroup:false,
    userInfo:{},
    codeimg:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    var t = this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        t.setData({
          userInfo: res.data
        })
      },
      fail(){
        api.getUserInfo({
          success: (res) => {
            if (api.status.Reg.test(res.statusCode)) {
              t.setData({
                userInfo: res.data.data
              })
              wx.setStorage({
                key: 'userInfo',
                data: res.data.data
              })
              app.globalData.userInfo = res.data.data;
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
          data: {},
          header: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + app.globalData.token
          },
        })
      }
    })
    
  },
  urleditInformation:function(){
    wx.navigateTo({
      url: '../editInformation/editInformation',
    })
  },
  urlwrongTopic:function(){
    wx.navigateTo({
      url: '../wrongTopic/wrongTopic',
    })
  },
  urlmemo:function(){
    wx.navigateTo({
      url: '../memo/memo',
    })
  },
  urlcollection:function(){
    wx.navigateTo({
      url: '../collection/collection',
    })
  },
  urlrecord:function(){
    wx.navigateTo({
      url: '../record/record',
    })
  },
  urlaboutUs:function(){
    wx.navigateTo({
      url: '../aboutUs/aboutUs',
    })
  },
  urlbaoban: function () {
    wx.navigateTo({
      url: '../class/class',
    })
  },
  showGroup:function(){
    var t=this;
    if (t.data.codeimg == ''){
      api.getgroupqr({
        success: (res) => {
          if (api.status.Reg.test(res.statusCode)) {
            t.setData({
              codeimg: res.data.data.url,
              isshowgroup: true
            })
            // console.log(res)
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
    }else{
      t.setData({
        isshowgroup: true
      })
    }
    
  },
  closeGroup: function () {
    this.setData({
      isshowgroup: false
    })
  },
  myOrderFun:function(){
    wx.showModal({
      title: '提示',
      content: '暂时还没开放订单功能',
      showCancel:false,
      success(res) {
        if (res.confirm) {
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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