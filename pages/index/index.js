//index.js
//获取应用实例
const app = getApp()
const api = require('../../api/api.js');
function countdown(that) {
  var EndTime = that.data.end_time || [];
  var NowTime = new Date().getTime();
  var total_micro_second = EndTime - NowTime || [];
  // console.log(EndTime);
  // console.log(NowTime)
  // 渲染倒计时时钟
  that.setData({
    clock: dateformat(total_micro_second).time,
    day: dateformat(total_micro_second).day
  });
  if (total_micro_second <= 0) {
    that.setData({
      clock: "00:00:00", //已经截止
      day:0
    });
    return;
  }
  setTimeout(function () {
    total_micro_second -= 1000;
    countdown(that);
  }, 1000)
}

// 时间格式化输出，如11:03 25:19 每1s都会调用一次
function dateformat(micro_second) {
  // 总秒数
  var second = Math.floor(micro_second / 1000);
  // 天数
  var day = Math.floor(second / 3600 / 24);
  // 小时
  var hr = Math.floor(second / 3600 % 24) < 10 ? "0" + Math.floor(second / 3600 % 24) : Math.floor(second / 3600 % 24);
  // 分钟
  var min = Math.floor(second / 60 % 60) < 10 ? "0" + Math.floor(second / 60 % 60) : Math.floor(second / 60 % 60);
  // 秒
  var sec = Math.floor(second % 60) < 10 ? "0" + Math.floor(second % 60) : Math.floor(second % 60);
  return ({time:hr + ":" + min + ":" + sec,day:day});
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasSubjects:{
      certificate: { name: "**", id: "**" },
      phase: { name: "**", id: "**" },
      subject: { name: "**", id: "**" }
    },
    isSave: false,
    unchangeHasSubjects:{
      certificate: { name: "**", id: "**" },
      phase: { name: "**", id: "**" },
      subject: { name: "**", id: "**" }
    },
    end_time: '***',
    clock: '***',
    day:'***',
    token:'',
    IndexInfo:{
      chapter_practice:{
        correct:"**",
        completed:"**",
        total:"**"
      },
      past_papers: {
        correct: "**",
        completed: "**",
        total: "**"
      },
      mock_exam: {
        correct: "**",
        completed: "**",
        total: "**"
      }
    },//首页信息
    //控制progress
    count: 0, // 设置 计数器 初始为0
    countTimer: null,// 设置 定时器
    progress_txt: '**',// 提示文字
    isshowselect:false,
    // ++++++++++++++++++++++++++++
    // isshowxueduan: true,
    pageindex: 1,
    isShowNext: false,//是否显示下一步按钮
    isShowperv: false,//是否显示上一步按钮
    subjectList: [],//考证类型列表
    subjectSelectid: '',//选择的考证类型id
    subjectLabels: [],//添加学段列表
    studyDateid: '',//选择学段的id
    courseList: [],//课程添加列表
    courseSelectid: '',//选择课程的id
  },
  urlListFun:function(e){
    wx.navigateTo({
      url: '../list/list?type=' + e.currentTarget.dataset.type + '&subject_id=' + this.data.hasSubjects.subject.id + '&subjectName=' + this.data.hasSubjects.subject.name,
    })
  },
  urlChapterLists:function(){
    if (this.data.hasSubjects.phase){
      wx.navigateTo({
        url: '../chapterLists/chapterLists?subject_id=' + this.data.hasSubjects.subject.id + '&tag_id=' + this.data.hasSubjects.phase.id + '&subjectName=' + this.data.hasSubjects.subject.name,
      })
    }else{
      wx.navigateTo({
        url: '../chapterLists/chapterLists?subject_id=' + this.data.hasSubjects.subject.id,
      })
    }
    
  },
  
  getIndexInfo:function(subject_id){
    var t = this;
    wx.getStorage({
      key: 'token',
      success(_token) {
        api.indexInfo({
          success: (res) => {
            if (api.status.Reg.test(res.statusCode)) {
              wx.stopPullDownRefresh();
              t.setData({
                IndexInfo:res.data.data,
                progress_txt: parseFloat(res.data.data.learned.learned / res.data.data.learned.total).toFixed(3) * 100,
                end_time: new Date(res.data.data.test_date.replace(/-/g, "/")),//new Date(res.data.data.test_date), //new Date(2019, 11, 25, 14, 51, 0, 0),
                isshowselect: false
              })
              // console.log("截止时间")
              // console.log(res.data.data.test_date)
              // console.log(new Date(res.data.data.test_date.replace(/-/g, "/")))
              // console.log(new Date(res.data.data.test_date))
              // 学习进度环形图
              //绘制背景
              t.drawProgressbg();
              //开始progress
              //参数在0——60之间，60为一圈
              t.startProgress(parseFloat(t.data.progress_txt) / 100 * 60);
              // t.startProgress(parseFloat(t.data.progress_txt) * 60);
              //调用上面定义的递归函数，一秒一刷新时间
              countdown(t);
            } else {
              wx.showToast({
                title: res.message,
                icon: 'none',
                duration: 2000
              })
            }
          },
          method: "GET",
          data: { subject_id: subject_id },
          header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + _token.data },
        })
      }
    })
  },
  getHassubjects: function (options,_token){
    var t = this;
    // 渲染首页内容
    if (app.globalData.subjectId || options.subject_id) {
      t.getIndexInfo(options.subject_id || app.globalData.subjectId)
    } else {
      // 获取在学科目
      api.getHassubjects({
        success: (res) => {
          if (api.status.Reg.test(res.statusCode)) {
            wx.stopPullDownRefresh();
            if (res.data.data[0].tags.length > 0){
              var _hasSubjects = {
                certificate: { name: res.data.data[0].father.subject_name, id: res.data.data[0].father.id },
                phase: { name: res.data.data[0].tags[0].tag_name, id: res.data.data[0].tags[0].id },
                subject: { name: res.data.data[0].subject_name, id: res.data.data[0].id }
              };
            }else{
              var _hasSubjects = {
                certificate: { name: res.data.data[0].father.subject_name, id: res.data.data[0].father.id },
                // phase: { name: res.data.data[0].tags[0].tag_name, id: res.data.data[0].tags[0].id },
                subject: { name: res.data.data[0].subject_name, id: res.data.data[0].id }
              };
            }
            
            t.setData({
              hasSubjects: _hasSubjects,
              unchangeHasSubjects: JSON.parse(JSON.stringify(_hasSubjects))
            })
            app.globalData.subjectId = res.data.data[0].id;
            app.globalData.hasSubjects = _hasSubjects;
            t.getIndexInfo(res.data.data[0].id)
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none',
              duration: 2000
            })
          }
        },
        method: "GET",
        header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + _token },
      })
    }
  },
  onPullDownRefresh() {
    var t = this;
    t.drawProgressbg();
    t.startProgress(parseFloat(t.data.progress_txt) / 100 * 60);
    // 查看是否授权
    if (app.globalData.token == '') {
      wx.login({
        success(_code) {
          if (_code.code) {
            // 调用接口
            api.getAuthorization({
              success: (res) => {
                if (api.status.Reg.test(res.statusCode)) {
                  // console.log(res)
                  if (res.data.data && res.data.data.token) {
                    app.globalData.token = res.data.data.token;
                    wx.setStorageSync('token', res.data.data.token)
                    t.setData({
                      token: res.data.data.token
                    })
                    t.getHassubjects(res.data.data.token)
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
      // console.log("777")
      wx.getStorage({
        key: 'token',
        success(_token) {
          console.log(_token.data)
          t.getHassubjects( _token.data)
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.hasSubjects)
    var t = this;
    if (options.user_id){//分享卡片进来
      wx.reLaunch({
        url: '../sharingPower/sharingPower?option=' + JSON.stringify(options)
      })
    }
    if (app.globalData.hasSubjects.certificate){
      t.setData({
        hasSubjects: app.globalData.hasSubjects
      })
    }
    // t.setData({
    //   end_time: new Date(2018, 11, 25, 13, 51, 0, 0) //项目截止时间，时间戳，单位毫秒
    // })
    // console.log('结束时间：' + t.data.end_time);
    //调用上面定义的递归函数，一秒一刷新时间
    // countdown(t);
    // 学习进度环形图
    //绘制背景
    t.drawProgressbg();
    //开始progress
    //参数在0——60之间，60为一圈
    t.startProgress(parseFloat(t.data.progress_txt) / 100 * 60);
    // t.startProgress(parseFloat(t.data.progress_txt) * 60);
    // 查看是否授权
    if (app.globalData.token == ''){
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
                  // console.log(res)
                  if (res.data.data && res.data.data.token) {
                    app.globalData.token = res.data.data.token;
                    wx.setStorageSync('token', res.data.data.token)
                    t.setData({
                      token: res.data.data.token
                    })
                    t.getHassubjects(options,res.data.data.token)
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
              data: {code:_code.code},
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
    }else{
      // console.log("777")
      wx.getStorage({
        key: 'token',
        success(_token) {
          console.log(_token.data)
          t.getHassubjects(options, _token.data)
        }
      })
    }
    
  },
  changePageindex: function (e) {
    this.setData({
      pageindex: e.target.dataset.pageindex
    })
    if (e.target.dataset.pageindex == 3){
      // console.log(this.data.subjectSelectid)
      // console.log(this.data.studyDateid)
      this.getSubjectList(this.data.subjectSelectid, this.data.studyDateid);
    } else if (e.target.dataset.pageindex == 1){
      // console.log(this.data.hasSubjects)
      // for(var i = 0; i < this.data.subjectList.length; i++){
      //   if (this.data.hasSubjects.certificate.id == this.data.subjectList[i].id){
      //     console.log(this.data.hasSubjects.certificate.id)
      //     console.log(this.data.subjectList[i].id)
      //     console.log(this.data.hasSubjects)
      //     this.setData({
      //       subjectSelectid: this.data.subjectList[i].id
      //     })
      //   }
      // }
    }
  },
  openselectSubjectFun: function () {
    if (this.data.isshowselect){
      this.closeSubjectSelect()
    }else{
      this.getSubjectList()

      this.setData({
        isshowselect: true,
        isSave: false,
        pageindex: 1,
        // hasSubjects:this.data.unchangeHasSubjects
      })
    }
    
  },
  closeSubjectSelect: function () {
    // console.log(this.data.isSave)
    if (!this.data.isSave){
      // console.log(this.data.unchangeHasSubjects)
      this.setData({
        hasSubjects: JSON.parse(JSON.stringify(this.data.unchangeHasSubjects))
      })
    }
    this.setData({
      isshowselect: false
    })
  },
  // 请求科目列表接口获取课程列表
  getSubjectList: function (subject_id, tag_id) {
    var per;
    if (subject_id || tag_id){
      per={
        subject_id: subject_id,
        tag_id: tag_id
      }
    } else {
      per = {}
    }
    api.getSubjectList({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          
          if (!(subject_id || tag_id)){
            this.setData({
              subjectList: res.data.data,
              // courseSelectid: res.data.data[0].id
            })
            for(var i =0; i < res.data.data.length; i++){
              if (this.data.hasSubjects.certificate.id == res.data.data[i].id){
                // console.log("888")
                this.setData({
                  subjectLabels: res.data.data[i].labels,//添加学段列表
                  subjectSelectid: res.data.data[i].id,//选择的考证类型id
                })
                for (var j = 0; j < res.data.data[i].labels.length; j++){
                  if (res.data.data[i].labels[j].id == this.data.hasSubjects.phase.id){
                    this.setData({
                      studyDateid: res.data.data[i].labels[j].id
                    })
                  }
                }
              }
            }
          }else{
            for(var i = 0; i < res.data.data.length; i++){
              if (res.data.data[i].id == this.data.hasSubjects.subject.id){
                this.setData({
                  courseSelectid: res.data.data[i].id
                })
              }
            }
            this.setData({
              courseList: res.data.data,
              // courseSelectid: res.data.data[0].id
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
      data: per,
      method: 'GET',
      header: { 'content-type': 'application/json' },
    })
  },
  // 选择考证类型
  selectSubject: function (e) {
    // console.log(e)
    var _hasSubjects = this.data.hasSubjects;
    _hasSubjects.certificate.id = e.target.dataset.id;
    _hasSubjects.certificate.name = e.target.dataset.name;
    
    this.setData({
      subjectSelectid: e.target.dataset.id,
      subjectLabels: e.target.dataset.labels,
      hasSubjects: _hasSubjects,
      // isShowperv: true,
      studyDateid: '',//清空上次选择的学段选择id
    })
    if (e.target.dataset.labels.length > 0) {
      // console.log(parseInt(this.data.pageindex) + 1)
      this.setData({
        pageindex: parseInt(this.data.pageindex) + 1
        // isshowxueduan: true
      })
      // if (this.data.studyDateid == '') {
      //   this.setData({
      //     isShowNext: false
      //   })
      // }
    } else {
      var _hasSubjects = this.data.hasSubjects;
      _hasSubjects.phase = { name: "**", id: "**" };
      this.setData({
        pageindex: parseInt(this.data.pageindex) + 2,
        hasSubjects:_hasSubjects
        // isshowxueduan:false
      })
      this.getSubjectList(this.data.subjectSelectid, this.data.studyDateid);

    }
  },
  // 添加学段
  selectData: function (e) {
    // console.log(e)
    var _phase = {
      id: e.target.dataset.id,
      name: e.target.dataset.name
    }
    var _hasSubjects = this.data.hasSubjects;
    _hasSubjects.phase = _phase;
    this.setData({
      studyDateid: e.target.dataset.id,
      pageindex: parseInt(this.data.pageindex) + 1,
      hasSubjects:_hasSubjects
      // isShowNext: true
    })
    this.getSubjectList(this.data.subjectSelectid, this.data.studyDateid);
  },
  // 添加课程
  selectCourse: function (e) {
    var _hasSubjects = this.data.hasSubjects;
    _hasSubjects.subject.id = e.target.dataset.id;
    _hasSubjects.subject.name = e.target.dataset.name;
    this.setData({
      courseSelectid: e.target.dataset.id,
      hasSubjects: _hasSubjects
    })
    // 保存用户所选科目
    api.saveSubjectId({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          app.globalData.subjectId = this.data.courseSelectid;
          app.globalData.hasSubjects = this.data.hasSubjects;
          // console.log('++++++++',JSON.parse(JSON.stringify(this.data.hasSubjects)))
          this.setData({
            unchangeHasSubjects: JSON.parse(JSON.stringify(this.data.hasSubjects)),
            isSave:true,
            subjectSelectid:this.data.hasSubjects.subject.id,
            studyDateid: this.data.hasSubjects.phase.id
          })
          this.getIndexInfo(e.target.dataset.id)
          // 跳到首页
          // wx.reLaunch({
          //   url: '../index/index?subject_id=' + this.data.courseSelectid,
          // })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: { subject_id: e.target.dataset.id },
      header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + app.globalData.token },
    })
  },
  /**
  * 画progress底部背景
  */
  drawProgressbg: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext('canvasProgressbg')
    // 设置圆环的宽度
    ctx.setLineWidth(2);
    // 设置圆环的颜色
    ctx.setStrokeStyle('#fff');
    // 设置圆环端点的形状
    ctx.setLineCap('round')
    //开始一个新的路径
    ctx.beginPath();
    //设置一个原点(60,60)，半径为100的圆的路径到当前路径
    ctx.arc(50, 50, 36, 0, 2 * Math.PI, false);
    //对当前路径进行描边
    ctx.stroke();
    //开始绘制
    ctx.draw();
  },

  /**
   * 画progress进度
   */
  drawCircle: function (step) {
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('canvasProgress');
    // 设置圆环的宽度
    context.setLineWidth(6);
    // 设置圆环的颜色
    context.setStrokeStyle('#ff5a00');
    // 设置圆环端点的形状
    context.setLineCap('round')
    //开始一个新的路径
    context.beginPath();
    //参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(50, 50, 36, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    //对当前路径进行描边
    context.stroke();
    //开始绘制
    context.draw()
  },

  /**
   * 开始progress
   */
  startProgress: function (per) {
    this.setData({
      count: 0
    });
    // 设置倒计时 定时器 每100毫秒执行一次，计数器count+1 ,耗时6秒绘一圈
    this.countTimer = setInterval(() => {
      if (this.data.count <= per) {
        /* 绘制彩色圆环进度条  
        注意此处 传参 step 取值范围是0到2，
        所以 计数器 最大值 60 对应 2 做处理，计数器count=60的时候step=2
        */
        this.drawCircle(this.data.count / (60 / 2))
        this.data.count++;
      } else {
        clearInterval(this.countTimer);
        // this.startProgress();
      }
    }, 30)
  },

})
