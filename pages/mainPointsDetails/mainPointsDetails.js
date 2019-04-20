var app = getApp();
const api = require('../../api/api.js');
var number,number1;
Page({
  data: {
    // winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    pointContent:{},
    content:'',
    point_id:'',//要点id
    chapter_id:'',//章id
    section_id:'',//小节id
    remember:false,//是否标记已掌握
    learned:false,//是否标记已学
    isNewLearn:true,//是否新学习的
    _change:false,
    // isNewremember:true,//是否新掌握
  },
  changeFun:function(){
    console.log(!this.data._change)
    this.setData({
      _change: !this.data._change
    })
  },
  srcmemoryCard:function(){
    if (!this.data.learned) {
      this.markLearned(this.data.point_id, this.data.chapter_id);
    }
    wx.navigateTo({
      url: '../memoryCard/memoryCard?point_id=' + this.data.point_id,
    })
  },
  // // 滚动切换标签样式
  // switchTab: function (e) {
  //   console.log(e.detail.current)
  //   this.setData({
  //     currentTab: e.detail.current
  //   });
  //   // this.checkCor();
  // },
  // 获取要点详情
  getPointContent: function (point_id){
    var t = this;
    api.getpointContent({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          t.setData({
            pointContent:res.data.data,
            content: JSON.parse(res.data.data.wxml_content)
          })
          if (res.data.data.learned && res.data.data.learned.has_mastered == 1){
            t.setData({
              remember:true,
              // isNewremember: false
            })
          }
          if (res.data.data.learned_count == 1) {
            t.setData({
              learned: true,
              isNewLearn:false,
              
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
      data: { chapter_id: point_id },
      header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + app.globalData.token },
    })
  },
  // 标记已学
  markLearned: function (point_id, chapter_id){
    api.markLearned({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          this.setData({
            learned: true
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "post",
      data: { chapter_id: chapter_id, point_id: point_id },
      header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + app.globalData.token },
      isshowLoading:true
    })
  },
  // 标记已掌握
  markRemeber: function (point_id){
    var _has_mastered;
    if(this.data.remember){
      _has_mastered = 0;
    }else{
      _has_mastered = 1;
    }
    api.markMastered({
      success: (res) => {
        // console.log(res)
        if (res.data.code == api.datacode.c200) {
          this.setData({
            remember: !this.data.remember,
          })
          
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "post",
      data: { chapter_id: this.data.chapter_id, point_id: point_id, has_mastered: _has_mastered },
      header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + app.globalData.token },
    })
  },
  onLoad: function (options) {
    // console.log(options)
    var that = this;
    that.setData({
      point_id: options.point_id,
      chapter_id: options.chapter_id,
      section_id: options.section_id
    })
    that.getPointContent(options.point_id)

    // 在该页面停留5秒，标记已学
    number = setTimeout(function callback() {
      if (!that.data.learned) {
        that.markLearned(options.point_id, options.chapter_id);
        clearTimeout(number)
      }
    }, 5000)
    
    

    //  高度自适应 
    // wx.getSystemInfo({
    //   success: function (res) {
    //     var clientHeight = res.windowHeight,
    //       clientWidth = res.windowWidth,
    //       rpxR = 750 / clientWidth;
    //     var calc = clientHeight * rpxR;
    //     console.log(calc)
    //     that.setData({
    //       winHeight: calc
    //     });
    //   }
    // });
  },
  // 点击记住了
  rememberFun:function(e){
    var t = this;
    // console.log(e.currentTarget.dataset.pointid)
    if (!t.data.learned) {
      t.markLearned(t.data.point_id, t.data.chapter_id);
    }
    number1 = setTimeout(function callback() {
      t.markRemeber(e.currentTarget.dataset.pointid)
      clearTimeout(number1)
    }, 250)
    
  },
  urlshortAnswer:function(e){
    if (!this.data.learned) {
      this.markLearned(this.data.point_id, this.data.chapter_id);
    }
    if(e.currentTarget.dataset.num == '0'){
      wx.showToast({
        title: '没有例题可做',
        icon: 'none',
        duration: 2000
      })
    }else{
      wx.navigateTo({
        url: '../exercises/exercises?pointid=' + this.data.point_id + '&chapter_id=' + this.data.chapter_id,
      })
      app.globalData.testType = '4';
    }
    
  },
  onUnload:function(){
    clearTimeout(number)
    clearTimeout(number1)
    wx.setStorageSync('remember', { id: this.data.point_id, isremember: this.data.remember, isNewLearn: this.data.isNewLearn, islearn: this.data.learned })
    if(this.data.isNewLearn){
      wx.setStorageSync('learned', { "point_id": this.data.point_id, "has_mastered": '0' })
    }
    // wx.setStorageSync('remember', { id: this.data.point_id,isNewremember:this.data.isNewremember, isremember: this.data.remember, isNewLearn: this.data.isNewLearn, islearn: this.data.learned})
  }
  // footerTap: app.footerTap
})