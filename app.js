//app.js
App({
  
  onLaunch: function (ops) {
    // 获取分享出去的点击用户信息
    if (ops.scene == 1044) {
      console.log(ops)
    }
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      //// console.log(res.hasUpdate)
      //// console.log('abcb')
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })

    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      // console.log('更新失败')
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function () {
    
  },
  globalData: {
    userInfo: null,
    token:'',
    subjectId:'',
    hasSubjects:{},
    testType:'',//首页选择的练习类型，1：章节练习，2：历年真题，3：模拟考试
    paperInfo:{},//当前试卷的信息
    chapterInfo:{},//当前章节的信息
    chaptercardInfo:{},//章节练习答题卡信息
    levelPaperList:[],//水平测试所有试题id
    isstudydata:false,//成绩统计页用，是否返回学习数据页
  }
})