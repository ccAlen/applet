// pages/editInformation/editInformation.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var t=this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        console.log(res.data)
        t.setData({
          userInfo:res.data
        })
      }
    })
  },
  updateUserInfo:function(type,value){
    var per = {};
    var t = this;
    if(type == 'name'){
      per={
        name:value
      }
    }else if(type == 'real_name'){
      per={
        real_name:value
      }
    } else if (type == 'mobile'){
      per={
        mobile:value
      }
    }else if(type == 'motto'){
      per={
        motto:value
      }
    }
    api.updateUserInfo({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          if (res.data.code == api.datacode.c200){
            var _userInfo = t.data.userInfo;
            _userInfo[type] = value;
            t.setData({
              userInfo: _userInfo
            })
            wx.setStorage({
              key: 'userInfo',
              data: _userInfo
            })
          }else{
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 2000
            })
          }
          
          // console.log(res)
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "post",
      data: per,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  changeName:function(e){
    // console.log(e.detail.value)
    this.updateUserInfo('name', e.detail.value)
  },
  changeRealName: function (e) {
    this.updateUserInfo('real_name', e.detail.value)
  },
  changePhone: function (e) {
    this.updateUserInfo('mobile', e.detail.value)
  },
  changeMotto: function (e) {
    this.updateUserInfo('motto', e.detail.value)
  },
  // 更改用户头像
  changeAvatar: function () {
    wx.showModal({
      title: '提示',
      content: '头像不能修改',
      showCancel:false,
      success(res) {
        if (res.confirm) {
          // console.log('用户点击确定')
        }
      }
    })
    // var t = this;
    // var _userInfo = t.data.userInfo;
    // wx.chooseImage({
    //   count: 1, // 默认9
    //   sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    //   sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    //   success: function (res) {
    //     // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
    //     var tempFilePaths = res.tempFilePaths
    //     console.log(tempFilePaths[0])
    //     // console.log('tempFilePaths[0]')
    //     wx.uploadFile({
    //       url: api.services + "api/profile/update", //接口地址
    //       filePath: tempFilePaths[0],
    //       name: 'avatar',
    //       formData: {
    //         avatar: tempFilePaths[0],
    //       },
    //       header: {
    //         'content-type': 'application/json',
    //         'Authorization': 'Bearer ' + app.globalData.token
    //       },
    //       success: function (res) {
    //         console.log(res)
    //         var data = res.data
    //         // t.setData({
    //         //   avatar: tempFilePaths[0]
    //         // })
    //         _userInfo.avatar = tempFilePaths[0];//这里需要修改，不能直接显示上传返回的图片地址，需要后台做处理，所以该头像图片不出来
    //         t.setData({
    //           userInfo: _userInfo
    //         })
    //         wx.setStorage({
    //           key: 'userInfo',
    //           data: _userInfo,
    //         })
    //       }
    //     })
    //   }
    // })
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