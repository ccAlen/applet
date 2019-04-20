// pages/typeSelection/typeSelection.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageindex:1,
    isShowNext:false,//是否显示下一步按钮
    isShowperv:false,//是否显示上一步按钮
    subjectList: [],//考证类型列表
    subjectSelectid:'',//选择的考证类型id
    subjectLabels:[],//添加学段列表
    studyDateid:'',//选择学段的id
    courseList:[],//课程添加列表
    courseSelectid:'',//选择课程的id
    hasSubjects: {
      certificate: { name: "**", id: "**" },
      // phase: { name: "**", id: "**" },
      subject: { name: "**", id: "**" }
    },
  },
  // 上一步
  prevStep:function(){
    if (this.data.pageindex == 3) {//添加课程页面
      if (this.data.subjectLabels.length > 0) {
        this.setData({
          pageindex: this.data.pageindex - 1
        })
      } else {
        this.setData({
          pageindex: this.data.pageindex - 2,
          isShowNext: true
        })
      }
    } else {//添加学段页面
      this.setData({
        pageindex: this.data.pageindex - 1,
        isShowNext:true
      })
    }
    

    
    // 修改标题
    if (this.data.pageindex == 1){
      wx.setNavigationBarTitle({
        title: '选择考证类型'
      })
    } else if (this.data.pageindex == 2){
      wx.setNavigationBarTitle({
        title: '添加学段'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '添加课程'
      })
    }
    // console.log(this.data.pageindex)
  },
  // 下一步
  nextStep: function () {
    if(this.data.pageindex == 1){//选择考证类型页面
      if (this.data.subjectLabels.length > 0) {
        console.log(this.data.subjectList)
        if (this.data.studyDateid == '') {
          this.setData({
            isShowNext: false
          })
        }
        this.setData({
          pageindex: this.data.pageindex + 1,
          // studyDateid: this.data.subjectLabels[0].id
        })
      } else {
        this.setData({
          pageindex: this.data.pageindex + 2
        })
      }
    }else{//添加学段页面
      this.setData({
        pageindex: this.data.pageindex + 1
      })
      // if (this.data.studyDateid == ''){
      //   this.setData({
      //     isShowNext:false 
      //   })
      // }
      
      
    }
    
    // 修改标题
    if (this.data.pageindex == 1) {
      this.setData({
        pagetitle: '选择考证类型'
      })
      wx.setNavigationBarTitle({
        title: '选择考证类型'
      })
    } else if (this.data.pageindex == 2) {
      this.setData({
        pagetitle: '添加学段'
      })
      wx.setNavigationBarTitle({
        title: '添加学段'
      })
    } else {
      this.setData({
        pagetitle: '添加课程'
      })
      wx.setNavigationBarTitle({
        title: '添加课程'
      })
    }
    // console.log(this.data.pageindex)
  },
  // 请求科目列表接口获取课程列表
  getSubjectList: function (subject_id, tag_id) {
    api.getSubjectList({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          this.setData({
            courseList: res.data.data,
            // courseSelectid: res.data.data[0].id
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: { subject_id: subject_id, tag_id: tag_id },
      method: 'GET',
      header: { 'content-type': 'application/json' },
    })
  },
  // 选择考证类型
  selectSubject:function(e){
    this.data.hasSubjects.certificate.id = e.target.dataset.id;
    this.data.hasSubjects.certificate.name = e.target.dataset.name;
    this.setData({
      subjectSelectid:e.target.dataset.id,
      subjectLabels:e.target.dataset.labels,
      isShowperv:true,
      studyDateid:'',//清空上次选择的学段选择id
    })
    if(e.target.dataset.labels.length > 0){
      this.setData({
        pageindex: this.data.pageindex + 1
      })
      if (this.data.studyDateid == '') {
        this.setData({
          isShowNext: false
        })
      }
    }else{
      this.setData({
        pageindex: this.data.pageindex + 2
      })
      this.getSubjectList(this.data.subjectSelectid, this.data.studyDateid);
      
    }
    // 修改标题
    if (this.data.pageindex == 1) {
      this.setData({
        pagetitle: '选择考证类型'
      })
      wx.setNavigationBarTitle({
        title: '选择考证类型'
      })
    } else if (this.data.pageindex == 2) {
      this.setData({
        pagetitle: '添加学段'
      })
      wx.setNavigationBarTitle({
        title: '添加学段'
      })
    } else {
      this.setData({
        pagetitle: '添加课程'
      })
      wx.setNavigationBarTitle({
        title: '添加课程'
      })
    }
    // console.log(e)
  },
  // 添加学段
  selectData:function(e){
    // console.log(e)
    var _phase = {
      id: e.target.dataset.id,
      name: e.target.dataset.name
    }
    this.data.hasSubjects.phase = _phase;
    this.setData({
      studyDateid:e.target.dataset.id,
      pageindex: this.data.pageindex + 1,
      isShowNext: true
    })
    // 修改标题
    if (this.data.pageindex == 1) {
      this.setData({
        pagetitle: '选择考证类型'
      })
      wx.setNavigationBarTitle({
        title: '选择考证类型'
      })
    } else if (this.data.pageindex == 2) {
      this.setData({
        pagetitle: '添加学段'
      })
      wx.setNavigationBarTitle({
        title: '添加学段'
      })
    } else {
      this.setData({
        pagetitle: '添加课程'
      })
      wx.setNavigationBarTitle({
        title: '添加课程'
      })
    }
    this.getSubjectList(this.data.subjectSelectid, this.data.studyDateid);
  },
  // 添加课程
  selectCourse:function(e){
    this.data.hasSubjects.subject.id = e.target.dataset.id;
    this.data.hasSubjects.subject.name = e.target.dataset.name;
    this.setData({
      courseSelectid:e.target.dataset.id
    })
    // 保存用户所选科目
    api.saveSubjectId({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          app.globalData.subjectId = this.data.courseSelectid;
          app.globalData.hasSubjects = this.data.hasSubjects;
          // 跳到首页
          wx.reLaunch({
            url: '../index/index?subject_id=' + this.data.courseSelectid,
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: { subject_id: e.target.dataset.id },
      header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + app.globalData.token  },
    })
    
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getSubjectList({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          this.setData({
            subjectList:res.data.data,
            // subjectSelectid:res.data.data[0].id,
            subjectLabels: res.data.data[0].labels
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: 'GET',
      header: { 'content-type': 'application/json' },
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
    console.log(app.globalData.token)
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