// pages/shortAnswer/shortAnswer.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'test',
    testType: '1', //首页选择的练习类型，1：章节练习，2：历年真题，3：模拟考试
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
    // +++++++++++
    collectionIdlist: [],
  },
  // 取消收藏
  cancalCollection: function() {
    api.favoriteQuestion({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          const {
            allQuestion,
            totalcount,
            currentQuestion,
            currentTab,
            collectionIdlist,
            last_sort
          } = this.data;
          for (var i = 0; i < collectionIdlist.length; i++) {
            if (collectionIdlist[i] == this.data.currentQuestion.id) {
              collectionIdlist.splice(i, 1);
              allQuestion.splice(i, 1);
              if (collectionIdlist.length <= 0) { //删除完了所有收藏
                wx.redirectTo({
                  url: '../collectionList/collectionList?type=' + app.globalData.testType
                })
              } else {
                // if (this.data.questionType == 'select') {//当前为选择题
                  if (i == 0) {//往后加载
                    if (allQuestion[i + 1] == undefined) {//需要请求接口加载
                      if (i + 1 < last_sort) {//下一题为选择题
                        this.getchoicebyid(collectionIdlist[0], (qestion) => {
                          this.setData({
                            currentQuestion: qestion,
                            currentTab: 0,
                            questionType: 'select',
                            last_sort: last_sort - 1
                          })
                        })
                      } else {//下一题为非选择题
                        this.getquestionbyid(collectionIdlist[0], (qestion) => {
                          this.setData({
                            currentQuestion: qestion,
                            currentTab: 0,
                            questionType: 'shortanswer'
                          })
                        })
                      }
                    }else{//之前加载过，直接在allQuestion里获取渲染就行了
                      if (i + 1 < last_sort) {//下一题为选择题
                        this.setData({
                          currentQuestion: allQuestion[0],
                          currentTab: 0,
                          questionType: 'select',
                          last_sort: last_sort - 1
                        })
                      } else {//下一题为非选择题
                        this.setData({
                          currentQuestion: allQuestion[0],
                          currentTab: 0,
                          questionType: 'shortanswer'
                        })
                      }
                    }
                    
                  } else {//否则退回前一个
                    

                    if (allQuestion[i - 1] == undefined) {//需要请求接口加载
                      if (i - 1 < last_sort) {//下一题为选择题
                        this.getchoicebyid(collectionIdlist[0], (qestion) => {
                          this.setData({
                            currentQuestion: qestion,
                            currentTab: i - 1,
                            questionType: 'select',
                            last_sort: last_sort - 1
                          })
                        })
                      } else {//下一题为非选择题
                        this.getquestionbyid(collectionIdlist[0], (qestion) => {
                          this.setData({
                            currentQuestion: qestion,
                            currentTab: i - 1,
                            questionType: 'shortanswer'
                          })
                        })
                      }
                    } else {//之前加载过，直接在allQuestion里获取渲染就行了
                      if (i - 1 < last_sort) {//下一题为选择题
                        this.setData({
                          currentQuestion: allQuestion[i - 1],
                          currentTab: i - 1,
                          questionType: 'select',
                          last_sort: last_sort - 1
                        })
                      } else {//下一题为非选择题
                        this.setData({
                          currentQuestion: allQuestion[i - 1],
                          currentTab: i - 1,
                          questionType: 'shortanswer'
                        })
                      }
                    }
                  }
                // }
              }
            }
          }
          console.log(collectionIdlist)
          this.setData({
            collectionIdlist: collectionIdlist,
            totalcount: collectionIdlist.length,
            allQuestion:allQuestion,
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
      data: {
        question_id: this.data.currentQuestion.id, //	试题id
        is_choice: this.data.questionType == 'select' ? "1" : "0", //试题类型：1选择题，0非选择题
        is_favorite: '0',
        source: this.data.testType //试题来源：1章节练习或要点详情里的例题，2历年真题，3模拟考试
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
    console.log(e.detail.value.textarea)
    var _choiceQuestion = this.data.currentQuestion;

    // 调用提交答案结果接口
    this.commitPaperAnswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '0', e.detail.value.textarea, '1')
  },
  choiseFun: function(e) {
    var _selted = e.currentTarget.dataset.selectindex;
    // console.log(e.currentTarget.dataset.selectindex)
    var _choiceQuestion = this.data.currentQuestion;
    if (_choiceQuestion.userSelected || _choiceQuestion.userSelected == 0) {
      // console.log("a")
      return false
    } else {
      _choiceQuestion.userSelected = _selted;

      this.setData({
        currentQuestion: _choiceQuestion
      })
      var _correct = (_selted == _choiceQuestion.correctAnswer ? "1" : "0")
      // 调用提交答案结果接口
      this.commitPaperAnswer(this.data.record_id, this.data.paper_id, _choiceQuestion.id, '1', e.currentTarget.dataset.answerid, _correct)
    }
    

  },
  // 提交答案结果接口
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
  inbtn: function(e) {},

  // 根据id获取一道选择题
  getchoicebyid: function(question_id, callback) {
    api.getchoicebyid({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          var _choiceQuestion = res.data.data;

          const { collectionIdlist, allQuestion } =this.data;
          for (var j = 0; j < _choiceQuestion.answers.length; j++) {
            if (_choiceQuestion.answers[j].correct_option == '1') {
              _choiceQuestion.correctAnswer = j;
            }
          }
          // allQuestion.push(_choiceQuestion)
          for (var k = 0; k < collectionIdlist.length; k++){
            if (collectionIdlist[k] == _choiceQuestion.id){
              if (allQuestion[k] == undefined){
                allQuestion.splice(k, 1, _choiceQuestion)
              }
              
            }
          }
          this.setData({
            currentQuestion: _choiceQuestion,
            allQuestion: allQuestion,
            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
          })
          // console.log(allQuestion)
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
        if (callback) callback(_choiceQuestion);
      },
      method: "GET",
      data: {
        question_id: question_id
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  // 根据id获取一道非选择题
  getquestionbyid: function(question_id, callback) {
    api.getquestionbyid({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          var _question = res.data.data;
          _question.shortanswerText = '';
          const { allQuestion, collectionIdlist } = this.data;
          // allQuestion.push(_question)
          for (var k = 0; k < collectionIdlist.length; k++) {
            if (collectionIdlist[k] == _question.id) {
              if (allQuestion[k] == undefined) {
                allQuestion.splice(k, 1, _question)
              }

            }
          }
          this.setData({
            currentQuestion: _question,
            allQuestion: allQuestion,
            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
          })
          // console.log(allQuestion)
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
        if (callback) callback(_question);
      },
      method: "GET",
      data: {
        question_id: question_id
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
    if (options.collectionid) { //个人中心——题目收藏进来
      wx.setNavigationBarTitle({
        title: '题目收藏'
      })
      t.setData({
        testType: options.source
      })
      // 获取收藏试题的ids
      api.getids({
        success: (res) => {
          if (api.status.Reg.test(res.statusCode)) {

            var _collectionIdlist = t.data.collectionIdlist;
            var _last_sort = 0;
            //选择题
            // _collectionIdlist.choice = res.data.data;
            _last_sort = res.data.data.length;
            t.setData({
              collectionIdlist: _collectionIdlist,
              last_sort: _last_sort
            })
            // console.log(_last_sort)
            //问答题
            api.getids({
              success: (short) => {
                if (api.status.Reg.test(short.statusCode)) {
                  // console.log(short)
                  var _collectionIdlist = t.data.collectionIdlist;
                  // _collectionIdlist.shortanswer = short.data.data;
                  _collectionIdlist = res.data.data.concat(short.data.data)
                  t.setData({
                    collectionIdlist: _collectionIdlist,
                    totalcount: _collectionIdlist.length,
                    allQuestion: new Array(_collectionIdlist.length)
                    // totalcountarr: new Array(parseInt(_collectionIdlist.length))
                  })
                  for (var i = 0; i < _collectionIdlist.length; i++) {
                    if (options.collectionid == _collectionIdlist[i]) {
                      t.setData({
                        currentTab: i
                      })
                      // console.log(i)
                      // console.log(options.ischoice)
                      if (options.ischoice == 1) { //选择题
                      // console.log("ppp")
                        t.getchoicebyid(options.collectionid, (qestion) => {
                          t.setData({
                            currentQuestion: qestion,
                            // currentTab: i,
                            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
                          })
                        })
                      } else { //非选择题
                        t.getquestionbyid(options.collectionid, (qestion) => {
                          t.setData({
                            currentQuestion: qestion,
                            // currentTab: i,
                            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
                          })
                        })
                      }
                     
                    }
                  }
                } else {
                  wx.showToast({
                    title: short.message,
                    icon: 'none',
                    duration: 2000
                  })
                }
              },
              method: "GET",
              data: {
                subject_id: app.globalData.subjectId,
                source: options.source,
                is_choice: '0'
              },
              header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + app.globalData.token
              },
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
          subject_id: app.globalData.subjectId,
          source: options.source,
          is_choice: '1'
        },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + app.globalData.token
        },
      })

      // if (options.ischoice == 1){//选择题
      //   t.getchoicebyid(options.collectionid)
      // }else{//非选择题
      //   t.getquestionbyid(options.collectionid)
      // }
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  beginFun: function() {
    const { allQuestion, collectionIdlist, last_sort } = this.data;
    if(allQuestion[0] != undefined){
      this.setData({
        currentTab: 0,
        currentQuestion: this.data.allQuestion[0]
      })
    }else{
      if ( last_sort > 0 ) { //加载选择题
        this.getchoicebyid(collectionIdlist[0], (qestion) => {
          this.setData({
            currentQuestion: qestion,
            currentTab: 0,
            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        })
      } else { //非选择题
        this.getquestionbyid(collectionIdlist[currentQuestionIndex + 1], (qestion) => {
          this.setData({
            currentQuestion: qestion,
            currentTab: 0,
            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        })

      }
    }
  },
  // 滑动
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
      collectionIdlist,
      totalcount
    } = this.data;
    // console.log(collectionIdlist)
    const currentQuestionIndex = collectionIdlist.findIndex(v => v == currentQuestion.id);

    if (Math.abs(poor) < maxPoor) { //当前滑动不满足最大差值 则返回
      return;
    }

    if (poor > 0) { //下一题
      if (currentQuestionIndex + 1 < totalcount) {
        if (allQuestion[currentQuestionIndex + 1] == undefined) { //如果当前为undefined，则请求接口
         
          this.setData({
            currentTab: currentQuestionIndex + 1,
            isshowParsing: false,
          });
          

          if (currentQuestionIndex + 1 < last_sort) { //选择题
            console.log("请求选择题")
            this.getchoicebyid(collectionIdlist[currentQuestionIndex + 1], (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: currentQuestionIndex + 1,
                questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
              })
            })
          } else if (currentQuestionIndex + 1 >= last_sort) { //非选择题
            console.log("开始加载简答题")
            this.getquestionbyid(collectionIdlist[currentQuestionIndex + 1], (qestion) => {
              this.setData({
                currentQuestion: qestion,
                currentTab: currentQuestionIndex + 1,
                questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
              })
            })

          }
        } else {
          if (currentQuestionIndex + 1 < last_sort) { //选择题
            this.setData({
              currentQuestion: allQuestion[currentQuestionIndex + 1],
              currentTab: currentQuestionIndex + 1,
              questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
            })
          } else {
            this.setData({
              currentQuestion: allQuestion[currentQuestionIndex + 1],
              currentTab: currentQuestionIndex + 1,
              questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
            })
          }
          
        }

      }

    } else if (currentQuestionIndex > 0) { //上一题
      // if (currentQuestionIndex - 1 < last_sort) { //选择题
      //   this.setData({
      //     questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
      //   })
      // } else {
      //   this.setData({
      //     questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
      //   })
      // }

      // this.setData({
      //   currentQuestion: allQuestion[currentQuestionIndex - 1],
      //   currentTab: currentQuestionIndex - 1
      // })
      if (allQuestion[currentQuestionIndex - 1] == undefined) { //如果当前为undefined，则请求接口

        this.setData({
          currentTab: currentQuestionIndex - 1,
          isshowParsing: false,
        });


        if (currentQuestionIndex - 1 < last_sort) { //选择题
          console.log("请求选择题")
          this.getchoicebyid(collectionIdlist[currentQuestionIndex - 1], (qestion) => {
            this.setData({
              currentQuestion: qestion,
              currentTab: currentQuestionIndex - 1,
              questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
            })
          })
        } else if (currentQuestionIndex - 1 >= last_sort) { //非选择题
          console.log("开始加载简答题")
          this.getquestionbyid(collectionIdlist[currentQuestionIndex - 1], (qestion) => {
            this.setData({
              currentQuestion: qestion,
              currentTab: currentQuestionIndex - 1,
              questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
            })
          })

        }
      } else {
        if (currentQuestionIndex - 1 < last_sort) { //选择题
          this.setData({
            currentQuestion: allQuestion[currentQuestionIndex - 1],
            currentTab: currentQuestionIndex - 1,
            questionType: 'select', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        } else {
          this.setData({
            currentQuestion: allQuestion[currentQuestionIndex - 1],
            currentTab: currentQuestionIndex - 1,
            questionType: 'shortanswer', //题目类型，单选还是简答题”select"or"shortanswer"
          })
        }

      }
    }
  }
})