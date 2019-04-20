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
    type: 'test',
    testType: '', //首页选择的练习类型，1：章节练习，2：历年真题，3：模拟考试
    winHeight: "", //窗口高度
    V1height: '',
    V2height: '',
    currentTab: 0, //预设当前项的值
    questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
    isshowParsing: false, //是否展开答案和解析
    hadAnswer: false, //是否有答案
    h1isshow: false,
    mengShow: false, //蒙层的显示与否
    aniStyle: true, //动画效果，默认slideup    
    choicesList: [], //选择题列表

    page: 1, //选择题页码
    shortPage: 0, //简答题页码
    choicestotal: 0, //选择题总题数
    shortTotal: 0, //简答题总题数
    totalcount: '', //所有题目总量
    shortanswerText: '', //用户简答题答案
    // iscollection:false,//当前题目是否有收藏
    currentQuestion: {}, //当前的题目所有内容
    // _________________________________________
    paper_id: '',
    allQuestion: [], //加载完毕的题目
    choiceQuestion: {}, //当前的题目所有内容
    iscomplete: false, //是否已完成所有答题（是否从查看解析中进来，如果是就显示正确答案和解析）
    record_id: '', //记录id
    last_sort: '', //试卷选择题最后一题的题号（选择题总题数）
    totalcountarr: [""],
    time: '00:00:00',
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
  recordtime: function(subject_id, source, cost_time, record_id) {
    api.recordtime({
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
        subject_id, //	科目id
        source, //试题来源：1章节练习或要点详情里的例题，2历年真题，3模拟考试
        cost_time, //当次学习的时间（单位分钟）
        record_id //答题记录id（章节练习暂不需此参数）
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 收藏
  collectionFun: function() {
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
        question_id: this.data.currentQuestion.id, //	试题id
        is_choice: this.data.questionType == 'select' ? "1" : "0", //试题类型：1选择题，0非选择题
        is_favorite: this.data.currentQuestion.has_favorite == '0' ? '1' : '0',
        source: this.data.testType //试题来源：1章节练习或要点详情里的例题，2历年真题，3模拟考试
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  bindFormSubmit(e) {
    console.log(e.detail.value.textarea)
    var _choiceQuestion = this.data.currentQuestion;
    if (this.data.testType == '2') {
      // 调用提交答案结果接口
      this.commitPaperAnswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '0', e.detail.value.textarea, '1')
    } else if (this.data.testType == '3') {
      this.getTestcommitanswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '0', e.detail.value.textarea, '1')
    }

  },
  choiseFun: function(e) {
    var _selted = e.currentTarget.dataset.selectindex;
    // console.log(e.currentTarget.dataset.selectindex)
    var _choiceQuestion = this.data.currentQuestion;
    _choiceQuestion.userSelected = _selted;
    this.setData({
      currentQuestion: _choiceQuestion
    })
    var abcd = _selted == '0' ? 'A' : _selted == '1' ? 'B' : _selted == '2' ? 'C' : _selted == '3' ? 'D' : '';
    var _correct = (_selted == _choiceQuestion.correctAnswer ? "1" : "0")
    if (app.globalData.testType == '2') { //历年真题
      // 调用提交答案结果接口
      this.commitPaperAnswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '1', e.currentTarget.dataset.answerid, _correct)
    } else if (app.globalData.testType == '3') { //模拟考试
      // 调用提交答案结果接口
      this.getTestcommitanswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '1', e.currentTarget.dataset.answerid, _correct)
    }

  },
  // 历年真题提交答案结果接口
  commitPaperAnswer: function(record_id, paper_id, question_id, is_choice, answer, correct) {
    api.commitPaperAnswer({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choiceQuestion = this.data.currentQuestion;
          _choiceQuestion.shortanswerText = answer;
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
        record_id: record_id, //	答题记录id
        paper_id: paper_id, //	试卷id
        question_id: question_id, //试题id
        is_choice: is_choice, //是否选择题：1是0非
        answer: answer, //选择题则为答案id，非选为具体答案内容
        correct: correct //答案是否正确：1是0非
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试记录答题结果
  getTestcommitanswer: function(record_id, paper_id, question_id, is_choice, answer, correct) {
    api.getTestcommitanswer({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choiceQuestion = this.data.currentQuestion;
          _choiceQuestion.shortanswerText = answer;
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
        record_id: record_id, //	答题记录id
        paper_id: paper_id, //	试卷id
        question_id: question_id, //试题id
        is_choice: is_choice, //是否选择题：1是0非
        answer: answer, //选择题则为答案id，非选为具体答案内容
        correct: correct //答案是否正确：1是0非
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 滚动切换标签样式
  switchTab: function(e) {
    return;
  },
  openParsing: function() {
    this.setData({
      isshowParsing: !this.data.isshowParsing
    })
  },
  //蒙层的显示
  showMeng: function(e) { //这是“确认下单”这整个购物车导航栏的点击事件
    this.setData({
      mengShow: true, //蒙层显示
      aniStyle: true　　　　　　　　 //设置动画效果为slideup
    })
  },
  outbtn: function(e) { //这是list-fix的点击事件，给它绑定事件，是为了实现点击其它地方隐藏蒙层的效果
    var that = this;
    this.setData({
      aniStyle: false　　　　　　 //设置动画效果为slidedown
    })
    setTimeout(function() { //延时设置蒙层的隐藏，这个定时器的时间，就是slidedown在css动画里设置的时间，这样就能实现slidedown动画完成后，蒙层才消失的效果。不设置定时器会导致动画效果看不见
      that.setData({
        mengShow: false
      })
    }, 500)
  },
  inbtn: function(e) { //这个事件必须有，就算不做什么事情也要写上去，因为这个事件是为了防止事件冒泡，导致点击in-list这里面的元素时，点击事件冒泡到list-fix触发它的slidedown事件。
    console.log("in")
  },
  // 获取历年真题选择题接口
  getChoices: function(paper_id, previous_sort,record_id, callback) {
    api.getPaperchoice({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choiceQuestion = res.data.data;
          var _allQuestion = this.data.allQuestion;
          for (var j = 0; j < _choiceQuestion.answers.length; j++) {
            if (_choiceQuestion.answers[j].correct_option == '1') {
              _choiceQuestion.correctAnswer = j;
            }
            if (_choiceQuestion.paper_record && _choiceQuestion.paper_record != null) {
              if (_choiceQuestion.answers[j].id == _choiceQuestion.paper_record.answer){
                _choiceQuestion.userSelected = j;
              }
            }
          }
          
          // _allQuestion.push(_choiceQuestion)
          if (_allQuestion[previous_sort] == undefined){
            _allQuestion.splice(previous_sort, 1, _choiceQuestion)
          }else{
            _allQuestion.splice(previous_sort, 0, _choiceQuestion)
          }
          
          this.setData({
            currentQuestion: _choiceQuestion,
            allQuestion: _allQuestion
          })
          if (callback) callback(_choiceQuestion);
          // console.log(_allQuestion)
          // console.log(this.data.last_sort)
          // console.log(_choiceQuestion)
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
        paper_id: paper_id,
        record_id: record_id,
        previous_sort: previous_sort
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 历年真题获取试卷非选择题
  getQuestions: function (paper_id, previous_sort, record_id, callback) {
    api.getPaperquestion({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          var _question = res.data.data;
          _question.shortanswerText = '';
          var _allQuestion = this.data.allQuestion;
          if (_question.paper_record && _question.paper_record != null) {
            _question.shortanswerText = _question.paper_record.answer;

          }
          // _allQuestion.push(_question)
          if (_allQuestion[previous_sort] == undefined) {
            _allQuestion.splice(previous_sort, 1, _question)
          } else {
            _allQuestion.splice(previous_sort, 0, _question)
          }
          
          this.setData({
            currentQuestion: _question,
            allQuestion: _allQuestion,
            hadAnswer: true,
          })
          if (callback) callback(_question);
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
        paper_id: paper_id,
        record_id: record_id,
        previous_sort: previous_sort
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试选择题接口
  getTestchoice: function (paper_id, previous_sort, record_id, callback) {
    api.getTestchoice({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choiceQuestion = res.data.data;
          var _allQuestion = this.data.allQuestion;
          for (var j = 0; j < _choiceQuestion.answers.length; j++) {
            if (_choiceQuestion.answers[j].correct_option == '1') {
              _choiceQuestion.correctAnswer = j;
            }
            if (_choiceQuestion.mock_record && _choiceQuestion.mock_record != null) {
              if (_choiceQuestion.answers[j].id == _choiceQuestion.mock_record.answer) {
                _choiceQuestion.userSelected = j;
              }
            }
          }
          // _allQuestion.push(_choiceQuestion)
          if (_allQuestion[previous_sort] == undefined) {
            _allQuestion.splice(previous_sort, 1, _choiceQuestion)
          } else {
            _allQuestion.splice(previous_sort, 0, _choiceQuestion)
          }
          this.setData({
            currentQuestion: _choiceQuestion,
            allQuestion: _allQuestion
          })
          if (callback) callback(_choiceQuestion);
          // console.log(_allQuestion)
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
        paper_id: paper_id,
        record_id: record_id,
        previous_sort: previous_sort
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试非选择题接口
  getTestquestion: function (paper_id, previous_sort, record_id, callback) {
    api.getTestquestion({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          var _question = res.data.data;
          _question.shortanswerText = '';
          var _allQuestion = this.data.allQuestion;
          if (_question.mock_record && _question.mock_record != null) {
            _question.shortanswerText = _question.mock_record.answer;

          }
          // _allQuestion.push(_question)
          if (_allQuestion[previous_sort] == undefined) {
            _allQuestion.splice(previous_sort, 1, _question)
          } else {
            _allQuestion.splice(previous_sort, 0, _question)
          }
          console.log(_allQuestion)
          this.setData({
            currentQuestion: _question,
            allQuestion: _allQuestion,
            hadAnswer: true,
          })
          if (callback) callback(_question);
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
        paper_id: paper_id,
        record_id: record_id,
        previous_sort: previous_sort
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    timerComponent.setCallback((time) => {
      this.setData({
        time
      });
    });


    const {
      allQuestion
    } = this.data;
    const currentQuestionIndex = allQuestion.findIndex(v => v.id == currentQuestion.id);
    wx.setNavigationBarTitle({
      title: app.globalData.paperInfo.name || options.levelpapername //页面标题为路由参数
    })

    var t = this;
    t.setData({
      paper_id: options.id,
      totalcount: options.count,
      testType: app.globalData.testType,
      countTime: true,
    })
    if (app.globalData.testType == '2') { //历年真题
      
      t.getrecordid(options.id)
      t.getlastsort(options.id)
      
    } else if (app.globalData.testType == '3') { //模拟考试
      // console.log('模拟考试')
      t.getTestrecordid(options.id)
      t.getTestlastsort(options.id)
      // t.getTestchoice(options.id, 0, (qestion) => {
      //   this.setData({
      //     currentQuestion: qestion,
      //     currentTab: currentQuestionIndex + 1
      //   })
      // })
    }

    //  高度自适应
    wx.getSystemInfo({
      success: function(res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        var V1height, V2height;
        var query = wx.createSelectorQuery();
        query.select('#getnavheight').boundingClientRect()
        query.select('#getfooterheight').boundingClientRect()
        query.exec(function(resu) {
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


  slideDown: function(e) {
    this.setData({
      h1isshow: !this.data.h1isshow
    })
  },
  urlsheet: function() {
    wx.navigateTo({
      url: '../sheet/sheet?paperid=' + this.data.paper_id + '&record_id=' + this.data.record_id 
    })
  },

  // 历年真题获取新的答卷id
  getrecordid: function(paper_id) {
    api.getrecordid({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          this.setData({
            record_id: res.data.data.record_id
          })
          this.getlastquestion(res.data.data.record_id)
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
        paper_id: paper_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 历年真题获取选择题最后一题的题号
  getlastsort: function(paper_id) {
    api.getlastsort({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res.data.data.last_sort)
          this.setData({
            last_sort: res.data.data.last_sort
          })
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
        paper_id: paper_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试获取新的答卷id
  getTestrecordid: function(paper_id) {
    api.getTestrecordid({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log('recordid=' + res.data.data.record_id)
          this.setData({
            record_id: res.data.data.record_id
          })
          this.getTestlastquestion(res.data.data.record_id)
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
        paper_id: paper_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟试卷获取选择题最后一题题号
  getTestlastsort: function(paper_id) {
    api.getTestlastsort({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log('最后一题题号=' + res.data.data.last_sort)
          this.setData({
            last_sort: res.data.data.last_sort
          })
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
        paper_id: paper_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  touchStartX: 0,
  handleTap1: function(res) {
    this.touchStartX = res.changedTouches[0].clientX;
  },
  handleEnd: function(res) {
    const clientX = res.changedTouches[0].clientX;
    const maxPoor = 100; //滑动最大差值
    const poor = this.touchStartX - clientX; //滑动差值
    const {
      allQuestion,
      currentQuestion,
      last_sort,
      paper_id,
      totalcount,
      currentTab
    } = this.data;
    // const currentQuestionIndex = allQuestion.findIndex(v => v.id == currentQuestion.id);
    const currentQuestionIndex = currentTab;
    if (Math.abs(poor) < maxPoor) { //当前滑动不满足最大差值 则返回
      return;
    }
    // if (currentQuestionIndex + 1 < totalcount) {
    //   if (currentQuestionIndex + 1 < last_sort) { //选择题
    //     console.log('a')
    //     this.setData({
    //       questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
    //     })
    //   } else {
    //     console.log('b')
    //     this.setData({
    //       questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
    //     })
    //   }
    // }
    // console.log(last_sort)
    // console.log(allQuestion)
    // console.log(currentQuestionIndex + 1)
    if (poor > 0) { //下一题
      // console.log(currentQuestionIndex + 1)
      // console.log(last_sort)
      if (currentQuestionIndex + 1 < totalcount) {
        if (currentQuestionIndex + 1 < last_sort) { //选择题
          // console.log('a')
          this.setData({
            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        } else {
          // console.log('b')
          this.setData({
            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        }
      }
      
      if (currentQuestionIndex + 1 < allQuestion.length) {
        // console.log("a")
        this.setData({
          currentQuestion: allQuestion[currentQuestionIndex + 1],
          currentTab: currentQuestionIndex + 1
        })
      } else {
        if (this.data.testType == '2') { //历年真题
          if (currentQuestionIndex + 1 < last_sort) { //选择题
            console.log("请求选择题")
            if (currentQuestionIndex + 1 == '0') {
              this.getChoices(paper_id, 0,this.data.record_id, (qestion) => {
                this.setData({
                  currentQuestion: qestion,
                  currentTab: 0
                })
              })
              // this.getChoices(paper_id, '0')
            } else {
              this.getChoices(paper_id, currentQuestionIndex + 1,this.data.record_id, (qestion) => {
                this.setData({
                  currentQuestion: qestion,
                  currentTab: currentQuestionIndex + 1
                })
              })
              // this.getChoices(paper_id, currentQuestionIndex + 1)
            }
          } else if (((currentQuestionIndex + 1 == last_sort) || (allQuestion.length < this.data.totalcount)) && currentQuestionIndex + 1 < totalcount) { //非选择题
            console.log("开始加载简答题")
            this.getQuestions(paper_id, currentQuestionIndex + 1,this.data.record_id, (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: currentQuestionIndex + 1
              })
            })
          }
          // this.getQuestions(paper_id, last_sort)
          // } else if (allQuestion.length < this.data.totalcount) {
          //   this.getQuestions(paper_id, (currentQuestionIndex + 1))
          // }
        } else if (this.data.testType == '3') { //模拟考试
          if (currentQuestionIndex + 1 < last_sort) { //选择题
            console.log("请求选择题")
            // this.setData({
            //   questionType: 'select'
            // })
            if (currentQuestionIndex + 1 == '0') {
              this.getTestchoice(paper_id, '0',this.data.record_id,
                (qestion) => {
                  this.setData({
                    currentQuestion: qestion,
                    currentTab: 0
                  })
                })
            } else {
              this.getTestchoice(paper_id, currentQuestionIndex + 1, this.data.record_id, 
                (qestion) => {
                  this.setData({
                    currentQuestion: qestion,
                    currentTab: currentQuestionIndex + 1
                  })
                })
            }
          } else if (((currentQuestionIndex + 1 == last_sort) || (allQuestion.length < this.data.totalcount)) && currentQuestionIndex + 1 < totalcount) { //非选择题
            console.log("开始加载简答题")
            this.getTestquestion(paper_id, (currentQuestionIndex + 1),this.data.record_id,
              (qestion) => {
                this.setData({
                  currentQuestion: qestion,
                  currentTab: currentQuestionIndex + 1
                })
              })
            // this.getTestquestion(paper_id, last_sort)
          }
          // else if (allQuestion.length < this.data.totalcount) {
          //   this.getTestquestion(paper_id, (currentQuestionIndex + 1))
          // }
        }
      }
    } else if (currentQuestionIndex > 0) { //上一题
      console.log("上一题")
      if (currentQuestionIndex - 1 < totalcount) {
        if (currentQuestionIndex - 1 < last_sort) { //选择题
          console.log('a')
          this.setData({
            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        } else {
          console.log('b')
          this.setData({
            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        }
      }
      // console.log(allQuestion)
      // console.log(allQuestion[currentQuestionIndex - 1])
      if (!allQuestion[currentQuestionIndex - 1] || allQuestion[currentQuestionIndex - 1] == undefined){//加载以前做的题
        if (currentQuestionIndex - 1 < last_sort) { //选择题
          if (this.data.testType == '2'){//历年真题
            this.getChoices(paper_id, currentQuestionIndex - 1, this.data.record_id, (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: currentQuestionIndex - 1,
                questionType: 'select',
              })
            })
          } else if (this.data.testType == '3'){//模拟考试
            this.getTestchoice(paper_id, currentQuestionIndex - 1, this.data.record_id, (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: currentQuestionIndex - 1,
                questionType: 'select',
              })
            })
          }
        
        }else{//非选择题
          if (this.data.testType == '2') {//历年真题
            this.getQuestions(paper_id, currentQuestionIndex - 1, this.data.record_id, (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: currentQuestionIndex - 1,
                questionType: 'shortanswer',
              })
            })
          } else if (this.data.testType == '3') {//模拟考试
            this.getTestquestion(paper_id, currentQuestionIndex - 1, this.data.record_id, (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: currentQuestionIndex - 1,
                questionType: 'shortanswer',
              })
            })
          }
        }
        
      }else{
        this.setData({
          currentQuestion: allQuestion[currentQuestionIndex - 1],
          currentTab: currentQuestionIndex - 1
        })
      }
    }
  },
  // 历年真题获取上次答题记录
  getlastquestion: function(record_id) {
    api.getlastquestion({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          const _questionrecord = res.data.data;
          if (_questionrecord.cost_time && _questionrecord.cost_time > 0){
            // 设置时间接着上次的计时
            timerComponent.setTime(_questionrecord.cost_time * 60).start();
          }else{//从0开始计时
            timerComponent.setTime(0).start();
          }
          
          if (_questionrecord.paper_record == 'null' || !_questionrecord.paper_record){
            this.getChoices(this.data.paper_id, 0, record_id, (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: 0
              })
            })
          }else{
            this.setData({
              questionType: _questionrecord.paper_record.question_type == '1' ? 'select' : 'shortanswer'
            })
            // 如果上次记录不为空，那么补上前面做的试题
            this.setData({
              allQuestion: new Array(_questionrecord.paper_record.paper_sort),
              currentTab: _questionrecord.paper_record.paper_sort - 1
            })
            if (_questionrecord.paper_record.question_type == '1'){//选择题
            
              this.getChoices(_questionrecord.paper_record.paper_id, _questionrecord.paper_record.paper_sort - 1, _questionrecord.paper_record.record_id, (qestion) => {
                this.setData({
                  currentQuestion: qestion,
                  currentTab: _questionrecord.paper_record.paper_sort - 1
                })
              })
            }else{//非选题
              this.getQuestions(_questionrecord.paper_record.paper_id, _questionrecord.paper_record.paper_sort - 1, _questionrecord.paper_record.record_id, (qestion) => {
                this.setData({
                  currentQuestion: qestion,
                  currentTab: _questionrecord.paper_record.paper_sort - 1
                })
              })
            }
            
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
      data: {
        record_id: record_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试获取上次答题记录
  getTestlastquestion: function(record_id) {
    api.getTestlastquestion({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          const _questionrecord = res.data.data;
          if (_questionrecord.cost_time && _questionrecord.cost_time > 0) {
            // 设置时间接着上次的计时
            timerComponent.setTime(_questionrecord.cost_time * 60).start();
          } else {//从0开始计时
            timerComponent.setTime(0).start();
          }

          if (_questionrecord.mock_record == 'null' || !_questionrecord.mock_record || _questionrecord.mock_record.length == 0) {
            console.log("c")
            this.getTestchoice(this.data.paper_id, 0, record_id, (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: 0
              })
            })
          } else {
            this.setData({
              questionType: _questionrecord.mock_record.question_type == '1' ? 'select' : 'shortanswer'
            })
            // 如果上次记录不为空，那么补上前面做的试题
            console.log(_questionrecord.mock_record.paper_sort)
            this.setData({
              allQuestion: new Array(_questionrecord.mock_record.paper_sort),
              currentTab: _questionrecord.mock_record.paper_sort - 1
            })
            if (_questionrecord.mock_record.question_type == '1') {//选择题
              // console.log("a")
              this.getTestchoice(_questionrecord.mock_record.paper_id, _questionrecord.mock_record.paper_sort, _questionrecord.mock_record.record_id, (qestion) => {
                this.setData({
                  currentQuestion: qestion,
                  currentTab: _questionrecord.mock_record.paper_sort
                })
              })
            }else{//非选题
              // console.log("b")
              this.getTestquestion(_questionrecord.mock_record.paper_id, _questionrecord.mock_record.paper_sort, _questionrecord.mock_record.record_id, (qestion) => {
                this.setData({
                  currentQuestion: qestion,
                  currentTab: _questionrecord.mock_record.paper_sort
                })
              })
            }
            
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
      data: {
        record_id: record_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
})