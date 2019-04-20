// components/footer/footer.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    firstLinkFun:function(){
      wx.reLaunch({
        url: '../index/index'
      })
    },
    secondLinkFun: function () {
      wx.reLaunch({
        url: '../studyData/studyData'
      })
    },
    thirdLinkFun: function () {
      wx.reLaunch({
        url: '../notes/notes'
      })
    }
  }
})
