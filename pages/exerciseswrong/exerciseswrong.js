// pages/shortAnswer/shortAnswer.js 
const app = getApp()
const api = require('../../api/api.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // wrongtype: '', //错题本进来，页面类型，1：章节练习，2：历年真题，3：模拟考试
    // wrongid: '', //错题本进来带过来的id
    testType: '2', //首页选择的练习类型，1：章节练习，2：历年真题，3：模拟考试,4:要点详情里面的例题
    winHeight: "", //窗口高度
    V1height: '',
    V2height: '',
    currentTab: 0, //预设当前项的值
    questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
    isshowParsing: false, //是否展开答案和解析
    hadAnswer: true, //是否有答案
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
    swiperarr: [''],
    allQuestion: [], //加载完毕的题目
    currentQuestion: {}, //当前的题目所有内容
    date:''
  },
 
  /**
   * 生命周期函数--监听页面卸载
   */
 
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
        source: this.data.testType //试题来源：1章节练习或要点详情里的例题，2历年真题，3模拟考试
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
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options.navindex)
    var t = this;
    if (options.navindex=='2'){//历年真题
      t.geterrors(options.record_id, options.only_error)
    } else if (options.navindex == '3') {//模拟考试
      t.getmockerrors(options.record_id, options.only_error)
    }
    t.setData({
      testType: options.navindex,
      date:options.date
    })
    

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

          V1height = resu[0].height;
          V2height = resu[1].height;

          t.setData({
            winHeight: calc - V1height - V2height,
            V1height: V1height,
            V2height: V2height
          });
        })

      }
    });
  },
  

  /**
   * 生命周期函数--监听页面显示
   */

  slideDown: function(e) {
    this.setData({
      h1isshow: !this.data.h1isshow
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
      totalcount
    } = this.data;
    const currentQuestionIndex = allQuestion.findIndex(v => v.id == currentQuestion.id);

    if (Math.abs(poor) < maxPoor) { //当前滑动不满足最大差值 则返回
      return;
    }
    
    if ((poor > 0) && (currentQuestionIndex + 1 < totalcount)) { //下一题
      if (allQuestion[currentQuestionIndex + 1].type_id) {
        this.setData({
          currentQuestion: allQuestion[currentQuestionIndex + 1],
          currentTab: currentQuestionIndex + 1,
          questionType: 'shortanswer',
          shortanswerText: allQuestion[currentQuestionIndex + 1].shortanswerText
        })
      } else {
        this.setData({
          currentQuestion: allQuestion[currentQuestionIndex + 1],
          currentTab: currentQuestionIndex + 1,
          questionType: 'select',
        })
        
      }
      

    } else if (currentQuestionIndex > 0 && (poor < 0)) { //上一题
      if (allQuestion[currentQuestionIndex - 1].type_id) {

        this.setData({
          currentQuestion: allQuestion[currentQuestionIndex - 1],
          currentTab: currentQuestionIndex - 1,
          questionType: 'shortanswer',
          shortanswerText: allQuestion[currentQuestionIndex - 1].shortanswerText
        })
      } else {

        this.setData({
          currentQuestion: allQuestion[currentQuestionIndex - 1],
          currentTab: currentQuestionIndex - 1,
          questionType: 'select',
        })
      }
      
    }
  },
  // 历年真题错题解析
  geterrors: function (record_id, only_error){
    api.geterrors({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _errors = res.data.data;
          if (_errors[0].type_id) {
            var _questionType = 'shortanswer'
          } else {
            var _questionType = 'select'
          }
          if (_errors.length > 0) {
            for (var j = 0; j < _errors.length; j++) {
              if (_errors[j].paper_record == '' || _errors[j].paper_record == null){//没有答题记录
                _errors[j].userSelected = '';
                // console.log(_errors[j].answers)
                // console.log(_errors[j].answers.length)
                if (_errors[j].type_id){//非选择题
                  _errors[j].shortanswerText = ''
                }else{//选择题
                  for (var k = 0; k < _errors[j].answers.length; k++) {
                    if (_errors[j].answers[k].correct_option == '1') {
                      _errors[j].correctAnswer = k
                    }
                  }
                }
                
              }else{//有答题记录
                if (_errors[j].type_id) {//非选择题
                  _errors[j].shortanswerText = _errors[j].paper_record.answer;
                } else {//选择题
                  // for (var k = 0; k < _errors[j].answers.length; k++) {
                    for (var k = 0; k < _errors[j].answers.length; k++) {
                      if (_errors[j].paper_record.answer == _errors[j].answers[k].id) {
                        
                        _errors[j].userSelected = k
                      }
                      if (_errors[j].answers[k].correct_option == '1') {
                        _errors[j].correctAnswer = k
                      }
                    }
                  // }
                }
                  
                    
                
                
              }
            }
          }
          this.setData({
            allQuestion: _errors,
            currentQuestion: _errors[0],
            questionType: _questionType,
            currentTab: 0,
            totalcount: _errors.length
          })
          console.log(_errors)
          // 获取试卷答题卡
          // api.getPapersheetdone({
          //   success: (_res) => {
          //     if (api.status.Reg.test(_res.statusCode)) {
          //       var _card = _res.data.data;
          //       console.log(_card)
          //       if (_errors.length > 0) {
          //         for (var j = 0; j < _errors.length; j++) {
          //           for (var row in _card) {
          //             if (row == _errors[j].id) {
          //               _errors[j].haddone = '1';
          //               _errors[j].isCorrect = _card[row].correct;
          //               if (_errors[j].type_id) {
          //                 _errors[j].shortanswerText = _card[row].answer
          //               } else {
          //                 for (var k = 0; k < _errors[j].answers.length; k++) {
          //                   if (_card[row].answer == _errors[j].answers[k].id) {
          //                     _errors[j].userSelected = k
          //                   }
          //                   if (_errors[j].answers[k].correct_option == '1'){
          //                     _errors[j].correctAnswer = k
          //                   }
          //                 }
          //               }
          //             }
          //           }
          //         }
          //       }
          //       console.log(_errors)
          //       this.setData({
          //         allQuestion: _errors,
          //         currentQuestion: _errors[0],
          //         questionType: _questionType,
          //         currentTab: 0,
          //         totalcount: _errors.length
          //       })
          //     } else {
          //       wx.showToast({
          //         title: _res.message,
          //         icon: 'none',
          //         duration: 2000
          //       })
          //     }
          //   },
          //   method: "GET",
          //   data: {
          //     record_id: record_id
          //   },
          //   header: {
          //     'content-type': 'application/json',
          //     'Authorization': 'Bearer ' + app.globalData.token
          //   },
          // })
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
        record_id: record_id, 
        only_error: only_error//1为错题解析，0为全部解析
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 模拟考试错题解析
  getmockerrors: function (record_id, only_error) {
    api.getmockerrors({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _errors = res.data.data;
          if (_errors[0].type_id){
            var _questionType = 'shortanswer'
          }else{
            var _questionType = 'select'
          }
          if (_errors.length > 0) {
            for (var j = 0; j < _errors.length; j++) {
              if (_errors[j].mock_record == '' || _errors[j].mock_record == null) {//没有答题记录
                _errors[j].userSelected = '';
                // console.log(_errors[j].answers)
                // console.log(_errors[j].answers.length)
                if (_errors[j].type_id) {//非选择题
                  _errors[j].shortanswerText = ''
                } else {//选择题
                  for (var k = 0; k < _errors[j].answers.length; k++) {
                    if (_errors[j].answers[k].correct_option == '1') {
                      _errors[j].correctAnswer = k
                    }
                  }
                }

              } else {//有答题记录
                if (_errors[j].type_id) {//非选择题
                  _errors[j].shortanswerText = _errors[j].mock_record.answer;
                } else {//选择题
                  // for (var k = 0; k < _errors[j].answers.length; k++) {
                    for (var k = 0; k < _errors[j].answers.length; k++) {
                      if (_errors[j].mock_record.answer == _errors[j].answers[k].id) {
                        _errors[j].userSelected = k
                      }
                      if (_errors[j].answers[k].correct_option == '1') {
                        _errors[j].correctAnswer = k
                      }
                    }
                  // }
                }




              }
            }
          }
          this.setData({
            allQuestion: _errors,
            currentQuestion: _errors[0],
            questionType: _questionType,
            currentTab: 0,
            totalcount: _errors.length
          })
          // if (_errors.length > 0) {
          //   for (var j = 0; j < _errors.length; j++) {
          //     if (_errors[j].mock_record == '' || _errors[j].mock_record == null) {//没有答题记录
          //       _errors[j].userSelected = '';
          //       for (var k = 0; k < _errors[j].answers.length; k++) {
          //         if (_errors[j].answers[k].correct_option == '1') {
          //           _errors[j].correctAnswer = k
          //         }
          //       }
          //     } else {//有答题记录
                
          //         for (var k = 0; k < _errors[j].answers.length; k++) {
          //           if (_errors[j].mock_record.answer == _errors[j].answers[k].id) {
          //             _errors[j].userSelected = k
          //           }
          //           if (_errors[j].answers[k].correct_option == '1') {
          //             _errors[j].correctAnswer = k
          //           }
          //         }

                
          //     }
          //   }
          // }
          // this.setData({
          //   allQuestion: _errors,
          //   currentQuestion: _errors[0],
          //   questionType: _questionType,
          //   currentTab: 0,
          //   totalcount: _errors.length
          // })
          // 获取试卷答题卡
          // api.getTestpapersheetdone({
          //   success: (_res) => {
          //     if (api.status.Reg.test(_res.statusCode)) {
          //       var _card = _res.data.data;
          //       console.log(_card)
          //       if (_errors.length > 0) {
          //         for (var j = 0; j < _errors.length; j++) {
          //           for (var row in _card) {
          //             if (row == _errors[j].id) {
          //               _errors[j].haddone = '1';
          //               _errors[j].isCorrect = _card[row].correct;
          //               if (_errors[j].type_id){
          //                 _errors[j].shortanswerText = _card[row].answer
          //               }else{
          //                 for (var k = 0; k < _errors[j].answers.length; k++){
          //                   if (_card[row].answer == _errors[j].answers[k].id){
          //                     _errors[j].userSelected = k
          //                   }
          //                   if (_errors[j].answers[k].correct_option == '1') {
          //                     _errors[j].correctAnswer = k
          //                   }
          //                 }
          //               }
          //             }
          //           }
          //         }
          //       }
          //       console.log(_errors)
          //       this.setData({
          //         allQuestion: _errors,
          //         currentQuestion: _errors[0],
          //         questionType: _questionType,
          //         currentTab: 0,
          //         totalcount: _errors.length
          //       })
          //     } else {
          //       wx.showToast({
          //         title: _res.message,
          //         icon: 'none',
          //         duration: 2000
          //       })
          //     }
          //   },
          //   method: "GET",
          //   data: {
          //     record_id: record_id
          //   },
          //   header: {
          //     'content-type': 'application/json',
          //     'Authorization': 'Bearer ' + app.globalData.token
          //   },
          // })
          
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
        record_id: record_id,
        only_error: only_error//1为错题解析，0为全部解析
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  
})