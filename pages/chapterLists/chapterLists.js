// pages/chapterLists/chapterLists.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    subject: {},
    navselected: '1',
    // h1isshow:false,
    isshowSummarybox: false,
    // isshowbox:false,
    chapterList: [],
    pointsList: [],
    pointsName: '',
    chapterSelectedId: '',
    section_id: '', //小节id
    chapter_id: '' //章id
  },
  getChapterList: function(subject_id, is_elite) {
    var t = this;
    var per;
    if (is_elite) {
      per = {
        subject_id: subject_id,
        is_elite: '1'
      }
    } else {
      per = {
        subject_id: subject_id
      }
    }
    api.getChapterList({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res)
          var _chapterList = res.data.data;
          for (var i = 0; i < _chapterList.length; i++) {
            _chapterList[i].state = false
          }
          t.setData({
            chapterList: _chapterList
          })
          // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

          // 获取用户已解锁章节
          api.getunlockedChapters({
            success: (father) => {
              if (api.status.Reg.test(res.statusCode)) {
                // console.log(father)
                // 获取用户已学章节信息
                api.getlearnedChapters({
                  success: (child) => {
                    if (api.status.Reg.test(res.statusCode)) {
                      // console.log(child)
                      var data = _chapterList;
                      var unlocked = father.data.data;
                      var learned = child.data.data;
                      var total = {};
                      for (var row in data) {
                        if (data[row]['unlock_pattern'] == 0 || unlocked.unlocked_ids.indexOf(data[row]['id']) != '-1') {
                          total[data[row]['id']] = 0;
                          let children = data[row]['children'];
                          for (var child in children) {
                            total[data[row]['id']] += children[child]['point_num'];
                            // 小节学习进度掌握进度
                            children[child].persent = {
                              learned_progress: [parseFloat(learned[children[child]['id']] ? learned[children[child]['id']]['learned_num'] : 0).toFixed(2), parseFloat(children[child]['point_num'] == 0 ? 1 : children[child]['point_num']).toFixed(2)],
                              mastered_degree: [parseFloat(learned[children[child]['id']] ? learned[children[child]['id']]['mastered_num'] : 0), parseFloat(children[child]['point_num'] == 0 ? 1 : children[child]['point_num']).toFixed(2)]
                            }
                          }
                        }
                      }
                      // console.log('ID', ' |', '章节名称', '|', '学习进度', '|', '掌握程度');
                      for (var chapter in data) {
                        let id = data[chapter]['id'];
                        // console.log(id)
                        // console.log(total[id])
                        var persent = {};
                        // 章学习进度掌握进度
                        data[chapter].persent = {
                          learned_progress: [parseFloat(unlocked[id] ? unlocked[id]['learned_progress'] : 0).toFixed(2), parseFloat(total[id] == 0 ? 1 : total[id]).toFixed(2)],
                          mastered_degree: [parseFloat(unlocked[id] ? unlocked[id]['mastered_degree'] : 0).toFixed(2), parseFloat(total[id] == 0 ? 1 : total[id]).toFixed(2)]
                        }
                        t.setData({
                          chapterList: data
                        })
                      }
                      // console.log(_chapterList)
                      t.setData({
                        chapterList: _chapterList
                      })
                    } else {
                      wx.showToast({
                        title: child.message,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  },
                  method: "GET",
                  data: {
                    subject_id: subject_id
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
              subject_id: subject_id
            },
            header: {
              'content-type': 'application/json',
              'Authorization': 'Bearer ' + app.globalData.token
            },
          })

        } else {
          wx.showToast({
            title: father.message,
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    var t = this;
    t.getChapterList(options.subject_id);
    t.setData({
      subject: options
    })
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
    var t = this;
    try {
      let value = wx.getStorageSync('remember')
      let _learned = wx.getStorageSync('learned')
      var _pointList = t.data.pointsList;
      var _chapterList = t.data.chapterList;
      // 是否已掌握，更改章和小节的掌握进度
      if (_learned && value) {
        // console.log("这里")
        let _has_mastered = (_learned.has_mastered == '0' ? false : true);
        if (_has_mastered != value.isremember) { //改变了标记掌握状态
          // console.log("0")
          // 遍历改变章和小节掌握进度
          for (var j = 0; j < _chapterList.length; j++) {
            if (t.data.chapter_id == _chapterList[j].id) {
              if (value.isremember) {
                _chapterList[j].persent.mastered_degree[0] = parseInt(_chapterList[j].persent.mastered_degree[0]) + 1;
              } else {
                _chapterList[j].persent.mastered_degree[0] = parseInt(_chapterList[j].persent.mastered_degree[0]) - 1;
              }
              t.setData({
                chapterList: _chapterList
              })
              for (var k = 0; k < _chapterList[j].children.length; k++) {
                if (_chapterList[j].children[k].id == t.data.section_id) {
                  if (value.isremember) {
                    _chapterList[j].children[k].persent.mastered_degree[0] = parseInt(_chapterList[j].children[k].persent.mastered_degree[0]) + 1;
                  } else {
                    _chapterList[j].children[k].persent.mastered_degree[0] = parseInt(_chapterList[j].children[k].persent.mastered_degree[0]) - 1;
                  }
                  t.setData({
                    chapterList: _chapterList
                  })
                }
              }
            }
          }
        }
      }
      if (value) {

        // 遍历改变要点已掌握状态
        for (var i = 0; i < _pointList.length; i++) {
          if (_pointList[i].id == value.id) {
            // console.log(t.data.chapterList)
            // console.log(t.data.section_id, t.data.chapter_id)
            if (_pointList[i].learned == null) {
              _pointList[i].learned = {}
            }
            _pointList[i].learned.has_mastered = value.isremember ? '1' : '0';
            t.setData({
              pointsList: _pointList
            })
          }
        }
        if (value.islearn) {
          // 遍历改变章和小节掌握进度
          for (var j = 0; j < _chapterList.length; j++) {
            if (t.data.chapter_id == _chapterList[j].id) {
              // 章
              if (value.isNewLearn && value.islearn) {
                _chapterList[j].persent.learned_progress[0] = parseInt(_chapterList[j].persent.learned_progress[0]) + 1;
              }
              t.setData({
                chapterList: _chapterList
              })
              for (var k = 0; k < _chapterList[j].children.length; k++) {
                if (_chapterList[j].children[k].id == t.data.section_id) {
                  // 小节
                  if (value.isNewLearn && value.islearn) {
                    _chapterList[j].children[k].persent.learned_progress[0] = parseInt(_chapterList[j].children[k].persent.learned_progress[0]) + 1;
                  }

                  t.setData({
                    chapterList: _chapterList
                  })
                }
              }
            }
          }
        } 
        // else {
        //   console.log("取消已掌握")
        // }

      }
    } catch (e) {
      console.log(e)
    }
  },

  changeNav: function(e) {
    // console.log(e.currentTarget.dataset.index)
    var t = this;
    var per;
    if (e.currentTarget.dataset.index == 2) { //精华模式
      t.getChapterList(t.data.subject.subject_id, '1');
    } else { //普通模式
      t.getChapterList(t.data.subject.subject_id);
    }

    t.setData({
      navselected: e.currentTarget.dataset.index
    })
  },
  slideDown: function(e) {
    var t = this;
    var _chapterList = t.data.chapterList;
    for (var i = 0; i < _chapterList.length; i++) {
      if (_chapterList[i].id == e.currentTarget.dataset.id) {
        _chapterList[i].state = !(_chapterList[i].state);
        t.setData({
          chapterList: _chapterList
        })
      }
    }

  },
  closeSummarybox: function() {
    this.setData({
      isshowSummarybox: false
    })
  },
  openSummarybox: function(e) {
    // console.log(e)
    var t = this;
    var per;
    if (t.data.navselected == '1') { //普通模式
      per = {
        chapter_id: e.currentTarget.dataset.id
      }
    } else { //精华模式
      per = {
        chapter_id: e.currentTarget.dataset.id,
        is_elite: '1'
      }
    }
    api.getpointsList({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          // console.log(res.data.data)
          t.setData({
            isshowSummarybox: true,
            pointsList: res.data.data,
            pointsName: e.currentTarget.dataset.pointsname,
            section_id: e.currentTarget.dataset.id,
            chapter_id: e.currentTarget.dataset.chapterid
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
      method: "GET",
      data: per,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  urlMainpoint: function(e) {
    // console.log(e)
    this.setData({
      chapterSelectedId: e.currentTarget.dataset.id
    })
    wx.setStorageSync('learned', e.currentTarget.dataset.learned)
    wx.navigateTo({
      url: '../mainPointsDetails/mainPointsDetails?point_id=' + e.currentTarget.dataset.id + '&section_id=' + this.data.section_id + '&chapter_id=' + this.data.chapter_id,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    console.log("分享")
  }
})