// pages/shortAnswer/shortAnswer.js
const app = getApp()
const api = require('../../api/api.js');
const {
  createTimer
} = require('../../utils/timer.js');
const timerComponent = createTimer();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // type: 'test',
    // testType: '',//首页选择的练习类型，1：章节练习，2：历年真题，3：模拟考试
    winHeight: "",//窗口高度
    V1height:'',
    V2height:'',
    currentTab: 0, //预设当前项的值
    questionType: 'select',//题目类型，单选还是简答题”select"or"shortanswer"
    isshowParsing:false,//是否展开答案和解析
    hadAnswer:false,//是否有答案
    // h1isshow: false,
    // mengShow: false,//蒙层的显示与否
    // aniStyle: true,    //动画效果，默认slideup    
    // choicesList:[],//选择题列表
    
    // page:1,//选择题页码
    // shortPage:0,//简答题页码
    // choicestotal:0,//选择题总题数
    // shortTotal:0,//简答题总题数
    totalcount:'',//所有题目总量
    // shortanswerText:'',//用户简答题答案
    // // iscollection:false,//当前题目是否有收藏
    currentQuestion: {},//当前的题目
    // _________________________________________
    paper_id: '',
    allQuestion:[],//加载完毕的题目
    choiceQuestion:{},//当前的题目所有内容
    iscomplete:false,//是否已完成所有答题（是否从查看解析中进来，如果是就显示正确答案和解析）
    record_id: '', //记录id
    last_sort: '',//试卷选择题最后一题的题号（选择题总题数）
    totalcountarr: [""],
    time: '00:00:00',
    allpaperidarr:[],
    title:'',
    countTime: false,
  },
  onShow: function () {
    // console.log(this.data.countTime)
    if (this.data.allQuestion.length > 0) {
      timerComponent.start();
    }

  },

  onUnload: function () {
    const cost_time = timerComponent.getMinutes();
    timerComponent.stop(timerComponent.format());
    this.setData({
      time: '00:00:00',
      countTime: false
    });

    this.recordtime(app.globalData.subjectId, this.data.testType, cost_time, this.data.record_id)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onHide: function () {
    // this.close();
    timerComponent.stop();
    const cost_time = timerComponent.getMinutes();
    this.recordtime(app.globalData.subjectId, this.data.testType, cost_time, this.data.record_id)
  },
  // 记录学习时间
  recordtime: function (paper_id, cost_time) {
    api.recordleveltime({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // 调用记录用户学习时间数据接口


          console.log(res)
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "post",
      data: {
        paper_id,//	试卷id
        cost_time,//当次学习的时间（单位分钟）
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 收藏
  collectionFun:function(){
    api.favoriteQuestion({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choiceQuestion = this.data.currentQuestion;
          _choiceQuestion.has_favorite = (_choiceQuestion.has_favorite == '0' ? '1' : '0')
          this.setData({
            currentQuestion: _choiceQuestion
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
      method: "post",
      data: {
        question_id: this.data.currentQuestion.id,//	试题id
        is_choice: this.data.questionType == 'select' ? "1" : "0",//试题类型：1选择题，0非选择题
        is_favorite: this.data.currentQuestion.has_favorite == '0' ? '1' : '0',
        source: this.data.testType//试题来源：1章节练习或要点详情里的例题，2历年真题，3模拟考试
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // bindFormSubmit(e) {
  //   console.log(e.detail.value.textarea)
  //   var _choiceQuestion = this.data.choiceQuestion;
   
  //   // 调用提交答案结果接口
  //   this.commitPaperAnswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '0', e.detail.value.textarea,'1')
  // },
  choiseFun:function(e){
    console.log(e)
    var _selted = e.currentTarget.dataset.answerid;
    var _correctAnswer = e.currentTarget.dataset.correctanswer;
    var _userSelected;
    
    
    var _choiceQuestion = this.data.currentQuestion;
    for (var i = 0; i < _choiceQuestion.answers.length; i++){
      if (_choiceQuestion.answers[i].id == _selted){
        _choiceQuestion.userSelected = i;
        _userSelected = i
      }
    }
    
    this.setData({
      currentQuestion: _choiceQuestion
    })
    console.log(_userSelected)
    console.log(_correctAnswer)
    // var abcd = _selted == '0' ? 'A' : _selted == '1' ? 'B' : _selted == '2' ? 'C' : _selted == '3' ? 'D' : '';
    var _correct = (_userSelected == _correctAnswer ? "1" : "0")
    this.commitLevelAnswer(this.data.paper_id, _choiceQuestion.id, _correct, e.currentTarget.dataset.answerid)
    // if (app.globalData.testType == '2'){//历年真题
    //   // 调用提交答案结果接口
    //   this.commitPaperAnswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '1', e.currentTarget.dataset.answerid, _correct) 
    // } else if (app.globalData.testType == '3'){//模拟考试
    //   // 调用提交答案结果接口
    //   this.getTestcommitanswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '1', e.currentTarget.dataset.answerid, _correct) 
    // }
      
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    return;
    console.log(e.detail.current)
    
    // if (((e.detail.current > this.data.currentTab) && (e.detail.current - this.data.currentTab != '-1') && (e.detail.current - this.data.currentTab != '2')) || (e.detail.current - this.data.currentTab == '2')){
    //   console.log("右滑")
    // }else{
    //   console.log("左滑")
    // }
    // this.setData({
    //   currentTab: e.detail.current,
    //   isshowParsing: false,
    // });
  },
  openParsing:function(){
    this.setData({
      isshowParsing: !this.data.isshowParsing
    })
  },
  //蒙层的显示
  showMeng: function (e) {         //这是“确认下单”这整个购物车导航栏的点击事件
    this.setData({
      mengShow: true,           //蒙层显示
      aniStyle: true　　　　　　　　//设置动画效果为slideup
    })
  },
  outbtn: function (e) {           //这是list-fix的点击事件，给它绑定事件，是为了实现点击其它地方隐藏蒙层的效果
    var that = this;
    this.setData({
      aniStyle: false　　　　　　//设置动画效果为slidedown
    })
    setTimeout(function () {       //延时设置蒙层的隐藏，这个定时器的时间，就是slidedown在css动画里设置的时间，这样就能实现slidedown动画完成后，蒙层才消失的效果。不设置定时器会导致动画效果看不见
      that.setData({
        mengShow: false
      })
    }, 500)
  },
  inbtn: function (e) {          //这个事件必须有，就算不做什么事情也要写上去，因为这个事件是为了防止事件冒泡，导致点击in-list这里面的元素时，点击事件冒泡到list-fix触发它的slidedown事件。
    console.log("in")
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    timerComponent.setCallback((time) => {
      this.setData({
        time
      });
    });

    const levelpaperinfo = JSON.parse(options.levelpaperinfo);
    console.log(levelpaperinfo)
    wx.setNavigationBarTitle({
      title: levelpaperinfo.papername//页面标题为路由参数
    })
    
    var t = this;
    t.generatepaper(levelpaperinfo.id)
    t.setData({
      paper_id: levelpaperinfo.id,
      title: levelpaperinfo.papername,
      countTime: true,
    })
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        var V1height, V2height;
        var query = wx.createSelectorQuery();
        query.select('#getnavheight').boundingClientRect()
        query.select('#getfooterheight').boundingClientRect()
        query.exec(function (resu) {
          // console.log(resu)
          V1height = resu[0].height;
          V2height = resu[1].height;
          // console.log(calc)
          // console.log(V1height)
          // console.log(V2height)
          t.setData({
            winHeight: calc - V1height - V2height,
            V1height: V1height,
            V2height: V2height
          });
        })
        
      }
    });
  },

  
  slideDown: function (e) {
    this.setData({
      h1isshow: !this.data.h1isshow
    })
  },
  urlsheet:function(){
    wx.navigateTo({
      url: '../sheet/sheet?levelpaperid=' + this.data.paper_id + '&papername=' + this.data.title + '&isstudydata=true'
    })
  },
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // 水平测试
  // 获取随机试卷
  generatepaper: function (paper_id){
    api.generatepaper({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // timerComponent.start((time) => {
          //   this.setData({
          //     time
          //   });
          // }, res.data.data.cost_time);
          if (res.data.data.cost_time && res.data.data.cost_time > 0) {
            // 设置时间接着上次的计时
            timerComponent.setTime(res.data.data.cost_time * 60).start();
          } else {//从0开始计时
            timerComponent.setTime(0).start();
          }
          this.setData({
            allpaperidarr: res.data.data.questions,
            totalcount: res.data.data.questions.length,
            allQuestion: new Array(res.data.data.questions.length)
          })
          app.globalData.levelPaperList = res.data.data.questions;
          // console.log(res)
          if ((res.data.data.last_question_id != null) && (res.data.data.last_question_id != '0')){//有上次答题记录
            for(var i =0; i < res.data.data.questions.length; i++){
              if (res.data.data.questions[i].question_id == res.data.data.last_question_id.question_id){
                console.log(i)
                this.setData({
                  currentTab: i
                })
                this.getLevelquestions(paper_id, res.data.data.last_question_id.question_id, (qestion) => {
                  this.setData({
                    currentQuestion: qestion
                  })
                })
              }
            }
          }else{//没有上次答题记录，从第一题开始
            this.getLevelquestions(paper_id, res.data.data.questions[0].question_id, (qestion) => {
              console.log(qestion)
              this.setData({
                currentQuestion: qestion
              })
            })
          }
          
          
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
  // 获取随机试卷试题
  getLevelquestions: function (paper_id, question_id, callback){
    api.getLevelquestions({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choiceQuestion = res.data.data;
          // for (var i = 0; i < _choiceQuestion.length; i++){
            for(var j =0; j < _choiceQuestion.answers.length; j++){
              if (_choiceQuestion.answers[j].correct_option == '1'){
                var _correctAnswer = j;
              }
              if (_choiceQuestion.random_paper && _choiceQuestion.random_paper != 'null') {
                if (_choiceQuestion.answers[j].id == _choiceQuestion.random_paper.answer){
                  var _userSelected = j
                }
                
              }
            }
          // }
          
          // var _correctAnswer = _choiceQuestion.answers.find((element) => (element.correct_option == '1'));
          _choiceQuestion.correctAnswer = _correctAnswer;
          _choiceQuestion.userSelected = _userSelected;
          // console.log(_correctAnswer)
          console.log(_choiceQuestion)
          var _allQuestion = this.data.allQuestion;
          _allQuestion.splice(this.data.currentTab, 1, _choiceQuestion)
          // _allQuestion.push(_choiceQuestion)
          

          this.setData({
            currentQuestion: _choiceQuestion,
            allQuestion: _allQuestion,
          })
          if (callback) callback(_choiceQuestion);
          // if (qindex == '0'){
          //   this.setData({
          //      choiceQuestion: _choiceQuestion,
          //   })
          // }
          // if (qindex == '0' || qindex == '1' || qindex == '2'){
          //   console.log(_allQuestion)
          //   this.setData({
          //     totalcountarr: _allQuestion
          //   })
          // }
        } else {
          wx.showToast({
            title: '数据报错',
            icon: 'none',
            duration: 2000
          })
        }
      },
      data: {
        paper_id: paper_id,
        question_id: question_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  commitLevelAnswer: function (paper_id, question_id, correct, answer) {
    api.commitanswerlevet({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choiceQuestion = this.data.currentQuestion;
          this.setData({
            aniStyle: false,
            hadAnswer: true,
            mengShow: false,
            currentQuestion: _choiceQuestion
          })
          console.log(_choiceQuestion)
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: "post",
      data: {
        paper_id: paper_id,//	试卷id
        question_id: question_id,//试题id
        answer: answer,//选择题则为答案id，非选为具体答案内容
        correct: correct//答案是否正确：1是0非
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  touchStartX: 0,
  handleTap1: function (res) {
    this.touchStartX = res.changedTouches[0].clientX;
  },
  handleEnd: function (res) {
    const clientX = res.changedTouches[0].clientX;
    const maxPoor = 50;//滑动最大差值
    const poor = this.touchStartX - clientX;//滑动差值
    const { allQuestion, currentQuestion, paper_id, allpaperidarr, totalcount, currentTab } = this.data;
    // const currentQuestionIndex = allQuestion.findIndex(v => v.id == currentQuestion.id);
    const currentQuestionIndex = currentTab;
    if (Math.abs(poor) < maxPoor) {//当前滑动不满足最大差值 则返回
      return;
    }

    if (poor > 0) {//下一题
      if (currentQuestionIndex + 1 < totalcount) {
        if (!allQuestion[currentQuestionIndex + 1] || allQuestion[currentQuestionIndex + 1] == undefined) {//调用接口获取题目
          this.getLevelquestions(paper_id, allpaperidarr[currentQuestionIndex + 1].question_id, (qestion) => {
        // this.getChoices(this.data.paper_id, currentQuestionIndex + 1, (qestion) => {
            this.setData({
              currentQuestion: qestion,
              currentTab: currentQuestionIndex + 1
            })
          })
           
        } else {//获取以前加载过的题
          this.setData({
            currentQuestion: allQuestion[currentQuestionIndex + 1],
            currentTab: currentQuestionIndex + 1
          })
        }
      }
      // if (currentQuestionIndex == allQuestion.length - 1) {//如果当前提示为加载到的最后一题 则请求api 否则从allQuestion读取
      //   this.getLevelquestions(paper_id, allpaperidarr[currentQuestionIndex + 1].question_id,(qestion) => {
      //   // this.getChoices(this.data.paper_id, currentQuestionIndex + 1, (qestion) => {
      //     this.setData({
      //       currentQuestion: qestion,
      //       currentTab: currentQuestionIndex + 1
      //     })
      //   })
      // } else {
      //   this.setData({
      //     currentQuestion: allQuestion[currentQuestionIndex + 1],
      //     currentTab: currentQuestionIndex + 1
      //   })
      // }

    } else if (currentQuestionIndex > 0) {//上一题
      if (!allQuestion[currentQuestionIndex - 1] || allQuestion[currentQuestionIndex - 1] == undefined) {//调用接口获取题目
        this.getLevelquestions(paper_id, allpaperidarr[currentQuestionIndex - 1].question_id, (qestion) => {
          // this.getChoices(this.data.paper_id, currentQuestionIndex - 1, (qestion) => {
          this.setData({
            currentQuestion: qestion,
            currentTab: currentQuestionIndex - 1
          })
        })

      } else {//获取以前加载过的题
        this.setData({
          currentQuestion: allQuestion[currentQuestionIndex - 1],
          currentTab: currentQuestionIndex - 1
        })
      }
      // this.setData({
      //   currentQuestion: allQuestion[currentQuestionIndex - 1],
      //   currentTab: currentQuestionIndex - 1
      // })
    }
  }
})