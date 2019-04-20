// pages/shortAnswer/shortAnswer.js 
const app = getApp()
const api = require('../../api/api.js');
// const {
//   createTimer
// } = require('../../utils/timer.js');
// const timerComponent = createTimer();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wrongtype: '', //错题本进来，页面类型，1：章节练习，2：历年真题，3：模拟考试
    wrongid: '', //错题本进来带过来的id
    testType: '1', //首页选择的练习类型，1：章节练习，2：历年真题，3：模拟考试,4:要点详情里面的例题
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
    choicesList: [], //所有题目列表
    chapter_id: '',
    page: 1, //选择题页码
    shortPage: 0, //简答题页码
    choicestotal: 3, //选择题总题数
    shortTotal: 0, //简答题总题数
    totalcount: '', //所有题目总量
    shortanswerText: '', //用户简答题答案
    // iscollection:false,//当前题目是否有收藏
    currentQuestion: {}, //当前的题目所有内容
    time: '00:00:00',
    swiperarr: ['']
  },
  // onShow: function() {
  //   if (app.globalData.testType != '4') {
  //     timerComponent.start((time) => {
  //       this.setData({
  //         time
  //       });
  //     });
  //   }
    
  // },

  // onUnload: function() {
  //   if (app.globalData.testType != '4') {
  //     this.close();
  //   }
    
  // },
  /**
   * 生命周期函数--监听页面卸载
   */
  // onHide: function() {
  //   if (app.globalData.testType != '4'){
  //     this.close();
  //   }
    
  // },
  // close: function() {
  //   console.log("hide");
  //   const cost_time = timerComponent.getMinutes();
  //   timerComponent.stop(0);
  //   this.setData({
  //     time: "00:00:00"
  //   });

  //   this.recordtime(app.globalData.subjectId, this.data.testType, cost_time, this.data.record_id)
  // },
  // 记录学习时间
  // recordtime: function(subject_id, source, cost_time, record_id) {
  //   api.recordtime({
  //     success: (res) => {
  //       if (api.status.Reg.test(res.statusCode)) {
  //         // 调用记录用户学习时间数据接口


  //         console.log(res)
  //       } else {
  //         wx.showToast({
  //           title: res.message,
  //           icon: 'none',
  //           duration: 2000
  //         })
  //       }
  //     },
  //     method: "post",
  //     data: {
  //       subject_id, //	科目id
  //       source, //试题来源：1章节练习或要点详情里的例题，2历年真题，3模拟考试
  //       cost_time, //当次学习的时间（单位分钟）
  //       record_id //答题记录id（章节练习暂不需此参数）
  //     },
  //     header: {
  //       'content-type': 'application/json',
  //       'Authorization': 'Bearer ' + app.globalData.token
  //     },
  //   })
  // },
  // 收藏
  collectionFun: function() {
    api.favoriteQuestion({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _currentQuestion = this.data.currentQuestion;
          _currentQuestion.has_favorite = (_currentQuestion.has_favorite == '0' ? '1' : '0')
          this.setData({
            currentQuestion: _currentQuestion
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
      method: "post",
      data: {
        question_id: this.data.currentQuestion.id, //	试题id
        is_choice: this.data.questionType == 'select' ? "1" : "0", //试题类型：1选择题，0非选择题
        is_favorite: this.data.currentQuestion.has_favorite == '0' ? '1' : '0',
        source: this.data.testType == '4' ? '1' : this.data.testType //试题来源：1章节练习或要点详情里的例题，2历年真题，3模拟考试
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
    // this.setData({
    //   iscollection:!this.data.iscollection
    // })
  },
  bindFormSubmit(e) {
    // console.log(e.detail.value.textarea)
    // var _questionid;
    // for (var i = 0; i < this.data.choicesList.length; i++) {
    //   if (this.data.currentTab == i) {
    //     _questionid = this.data.choicesList[i].id
    //   }
    // }
    const { currentQuestion, choicesList } = this.data;
    for (var i = 0; i < choicesList.length; i++){
      if (choicesList[i].id == currentQuestion.id){
        choicesList[i].shortanswerText = e.detail.value.textarea;
      }
    }
    this.setData({
      choicesList
    })
    // 调用提交答案结果接口
    this.commitAnswer(this.data.chapter_id, currentQuestion.id, '0', e.detail.value.textarea)
  },
  choiseFun: function(e) {
    var _selted = e.currentTarget.dataset.selectindex;
    var _answerid = e.currentTarget.dataset.answerid;
    // console.log(e.currentTarget.dataset.selectindex)
    // console.log(this.data.currentTab)
    var _choicesList = this.data.currentQuestion;
    // for (var i = 0; i < _choicesList.length; i++) {
    //   if (i == this.data.currentTab) {
        if (_choicesList.userSelected || _choicesList.userSelected == 0) {
          // console.log("a")
          return false
        } else {
          // console.log("b")
          _choicesList.userSelected = _selted;
          this.setData({
            currentQuestion: _choicesList
          })
          // var abcd = _selted == '0' ? 'A' : _selted == '1' ? 'B' : _selted == '2' ? 'C' : _selted == '3' ? 'D' : '';
          var _correct = (_selted == _choicesList.correctAnswer ? "1" : "0")
          // 调用提交答案结果接口
          this.commitAnswer(this.data.chapter_id, e.currentTarget.dataset.question_id, '1', _answerid, _correct)
        }
    //   }
    // }
  },
  // 提交答案结果接口
  commitAnswer: function(_chapter_id, question_id, is_choice, users_answer, correct) {
    api.commitAnswer({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          this.setData({
            aniStyle: false,
            hadAnswer: true,
            mengShow: false,
            shortanswerText: users_answer ? users_answer : ''
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
      method: "post",
      data: {
        chapter_id: _chapter_id, //章id
        question_id: question_id, //	试题id
        is_choice: is_choice, //试题类型：1选择题，0非选择题
        users_answer: users_answer, //用户的答案
        correct: correct //是否答对：1是0非
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
  // 获取章节练习选择题
  getChoices: function(_chapter_id, page, isfirstload) {
    api.getChoices({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _choicesList = this.data.choicesList;
          _choicesList = _choicesList.concat(res.data.data);
          for (var i = 0; i < _choicesList.length; i++) {
            for (var j = 0; j < _choicesList[i].answers.length; j++) {
              if (_choicesList[i].answers[j].correct_option == '1') {
                _choicesList[i].correctAnswer = j;
              }
            }
          }
          this.setData({
            choicesList: _choicesList,
            choicestotal: res.data.page.total
          })
          if (isfirstload) {
            console.log(_choicesList[0])
            this.setData({
              currentQuestion: _choicesList[0]
            })
          }
          console.log(_choicesList)
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
        chapter_id: _chapter_id,
        per_page: '5',
        page: page
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 获取章节练习非选择题
  getQuestions: function(_chapter_id, page) {
    api.getQuestions({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          const _res = res.data.data;
          for(var i = 0; i < _res.length;i++){
            _res[i].shortanswerText = '';
          }
          var _choicesList = this.data.choicesList;
          _choicesList = _choicesList.concat(_res);
          
          this.setData({
            choicesList: _choicesList,
            shortTotal: res.data.page.total
          })
          console.log(_choicesList)
          // console.log(res.data.page.total)
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
        chapter_id: _chapter_id,
        per_page: '5',
        page: page
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
    console.log(options)
    var t = this;
    t.setData({
      testType: app.globalData.testType
    })
    if (options && options.pointid) { //要点详情里面的例题
      t.getexamples(options.pointid)
      t.setData({
        totalcount: '3',
        chapter_id: options.chapter_id,
        questionType: 'select'
      })
    } else if (options && options.chapter_id) { //章节练习习题
      t.setData({
        chapter_id: options.chapter_id,
        totalcount: options.count,

      })
      wx.setNavigationBarTitle({
        title: app.globalData.chapterInfo.name //页面标题为路由参数
      })
      t.getChoices(options.chapter_id, t.data.page, 'isfirstload')
    } else if (options && options.wrongid && options.wrongtype) { //错题本进来
      if (options.wrongtype == '1') {
        wx.setNavigationBarTitle({
          title: "错题本-章节练习"
        })
      } else if (options.wrongtype == '2') {
        wx.setNavigationBarTitle({
          title: "错题本-历年真题"
        })
      } else if (options.wrongtype == '3') {
        wx.setNavigationBarTitle({
          title: "错题本-模拟考试"
        })
      }
      t.setData({
        wrongtype: options.wrongtype,
        wrongid: options.wrongid
      })
      t.getWrongList(options.wrongtype, options.wrongid, '1', options.recordid)
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
  // 获取要点详情例题
  getexamples: function(pointid) {
    api.getexamples({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {

          var _choicesList = res.data.data;
          for (var i = 0; i < _choicesList.length; i++) {
            for (var j = 0; j < _choicesList[i].answers.length; j++) {
              if (_choicesList[i].answers[j].correct_option == '1') {
                _choicesList[i].correctAnswer = j;
              }
            }
          }
          console.log(_choicesList)
          this.setData({
            choicesList: _choicesList,
            questionType: 'select',
            choicestotal: _choicesList.length, //选择题题数
            currentQuestion: _choicesList[0],
            totalcount: _choicesList.length
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
        chapter_id: pointid
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 获取错题列表
  getWrongList: function (type, id, page, record_id) {
    var per = {};
    if (type == '1') {
      per = {
        chapter_id: id,
        page: page,
        per_page: '1000'
      };
    } else if (type == '2') {
      per = {
        paper_id: id,
        page: page,
        per_page: '1000',
        record_id: record_id
      };
    } else if (type == '3') {
      per = {
        mock_id: id,
        page: page,
        per_page: '1000',
        record_id: record_id
      };
    }
    api.getWrongList({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          var _choicesList = res.data.data;
          for (var i = 0; i < _choicesList.length; i++) {
            for (var j = 0; j < _choicesList[i].answers.length; j++) {
              if (_choicesList[i].answers[j].correct_option == '1') {
                _choicesList[i].correctAnswer = j
              }
              if (type == '1' && _choicesList[i].exercise_record.answer == _choicesList[i].answers[j].id) {
                _choicesList[i].userSelected = j;
              } else if (type == '2' && _choicesList[i].paper_record.answer == _choicesList[i].answers[j].id) {
                _choicesList[i].userSelected = j;
              } else if (type == '3' && _choicesList[i].mock_record.answer == _choicesList[i].answers[j].id) {
                _choicesList[i].userSelected = j;
              }
            }
          }
          console.log(_choicesList)
          this.setData({
            choicesList: _choicesList,
            totalcount: res.data.page.total,
            currentQuestion: _choicesList[0],

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
      data: per,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 删除错题
  deleteWrongchoice: function(type, fatherid, question_id) {
    var per = {};
    if (type == '1') {
      per = {
        chapter_id: fatherid,
        question_id: question_id
      };
    } else if (type == '2') {
      per = {
        paper_id: fatherid,
        question_id: question_id
      };
    } else if (type == '3') {
      per = {
        mock_id: fatherid,
        question_id: question_id
      };
    }
    api.deleteWrongchoice({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          console.log(res)
          const { currentQuestion, choicesList, totalcount} = this.data;
          const currentQuestionIndex = choicesList.findIndex(v => v.id == currentQuestion.id);
          for (var i = 0; i < choicesList.length; i++) {
            if (choicesList[i].id == question_id) {
              choicesList.splice(i, 1)
            }
          }
          if (totalcount - 1 <= 0) {//删除完了所有错题
            wx.redirectTo({
              url: '../wrongTopicList/wrongTopicList?type=' + app.globalData.testType
            })
          }else{
            if (currentQuestionIndex == 0){
              this.setData({
                choicesList: choicesList,
                totalcount: totalcount - 1,
                currentQuestion: choicesList[currentQuestionIndex]
              })
            }else{
              this.setData({
                choicesList: choicesList,
                totalcount: totalcount - 1,
                currentQuestion: choicesList[currentQuestionIndex - 1],
                currentTab: currentQuestionIndex - 1
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
      data: per,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 删除错题
  delectWrongFun: function() {
    this.deleteWrongchoice(this.data.wrongtype, this.data.wrongid, this.data.currentQuestion.id)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */

  slideDown: function(e) {
    this.setData({
      h1isshow: !this.data.h1isshow
    })
  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  urlsheet: function() {
    wx.navigateTo({
      url: '../sheet/sheet?chapterid=' + this.data.chapter_id
    })
  },
  // 从头开始
  beginFun: function() {
    this.setData({
      currentTab: 0,
      currentQuestion: this.data.choicesList[0]
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
      choicesList,
      currentQuestion,
      choicestotal,
      totalcount
    } = this.data;
    const currentQuestionIndex = choicesList.findIndex(v => v.id == currentQuestion.id);

    if (Math.abs(poor) < maxPoor) { //当前滑动不满足最大差值 则返回
      return;
    }
   
    if ((poor > 0) && (currentQuestionIndex + 1 < totalcount)) { //下一题
      if (this.data.wrongtype != '') {//错题本进来，全是选择题
        this.setData({
          questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
        })
      } else {
        if (currentQuestionIndex + 1 < choicestotal) { //选择题
          this.setData({
            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        } else {
          this.setData({
            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
            shortanswerText: choicesList[currentQuestionIndex + 1].shortanswerText,
            hadAnswer: choicesList[currentQuestionIndex + 1].shortanswerText == '' ? false : true
          })
        }
      }
      if ((currentQuestionIndex + 1 == choicesList.length - 1) && (currentQuestionIndex + 1 < totalcount - 1)) { //如果当前提示为加载到的最后一题 则请求api 否则从choicesList读取

      
        if (currentQuestionIndex + 1 < totalcount) {
          this.setData({
            currentTab: currentQuestionIndex + 1,
            isshowParsing: false,
            currentQuestion: choicesList[currentQuestionIndex + 1],
            
          });
          
          for (var i = 0; i < choicesList.length; i++) {
            if (currentQuestionIndex + 1 == i) {
              // console.log(choicesList[i])
              this.setData({
                currentQuestion: choicesList[i]
              })
            }
          }
          // 判断当前什么题型
          if (this.data.wrongtype != '') {//错题本进来，全是选择题
            this.setData({
              questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
            })
          }else{
            if ((currentQuestionIndex + 1) <= choicestotal) { //当前是选择题
              this.setData({
                questionType: 'select'
              })
            } else { //当前是简答题
              this.setData({
                questionType: 'shortanswer'
              })
            }
          }
          
          if (this.data.wrongtype == '') { //在不是错题本进来的情况下，因为错题本进来只有选择题
            console.log(currentQuestionIndex + 1)
            console.log(choicesList.length - 1)
            // 判断加载选择题还是简答题
            if ((currentQuestionIndex + 1 == (choicesList.length - 1)) && (choicesList.length < choicestotal)) {
              // console.log(choicestotal)
              this.getChoices(this.data.chapter_id, this.data.page + 1)
              this.setData({
                page: this.data.page + 1
              })
            } else if ((currentQuestionIndex + 1 == choicestotal - 1) && (choicesList.length < this.data.totalcount)) {
              // console.log("zheli1")
              this.getQuestions(this.data.chapter_id, this.data.shortPage + 1)
              this.setData({
                shortPage: this.data.shortPage + 1,
                hadAnswer: false
              })

            } else if ((currentQuestionIndex + 1 < this.data.totalcount) && (currentQuestionIndex + 1 == choicesList.length - 1)){
              // console.log("222")
              this.getQuestions(this.data.chapter_id, this.data.shortPage + 1)
              this.setData({
                shortPage: this.data.shortPage + 1,
                hadAnswer: false
              })
            }
          }
        }

      } else {
        // console.log("666")
        this.setData({
          currentQuestion: choicesList[currentQuestionIndex + 1],
          currentTab: currentQuestionIndex + 1
        })
      }

    } else if (currentQuestionIndex > 0 && (poor < 0)) { //上一题
      if (this.data.wrongtype != '') {//错题本进来，全是选择题
        this.setData({
          questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
        })
      } else {
        if (currentQuestionIndex - 1 < choicestotal) { //选择题
          this.setData({
            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        } else {
          this.setData({
            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
            shortanswerText: choicesList[currentQuestionIndex - 1].shortanswerText,
            hadAnswer: choicesList[currentQuestionIndex - 1].shortanswerText == '' ? false : true
          })
        }
      }
      this.setData({
        currentQuestion: choicesList[currentQuestionIndex - 1],
        currentTab: currentQuestionIndex - 1
      })
    }
  }
})