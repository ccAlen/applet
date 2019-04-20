// pages/record/record.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navindex:'2',
    per:[],
    canvasimgarr:[],
    timeindex:'0',
    recordList:[],
    listpage:{},
    
  },
  // 历年真题获取答卷记录列表
  getUserrecord: function (recent,page){
    api.getUserrecord({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _list = res.data.data;
          var _recordList = this.data.recordList;
          _recordList = _recordList.concat(_list)
          var _per = this.data.per;
          console.log(_list)
          for(var i = 0; i < _list.length; i++){
            var percentage = parseFloat((_list[i].correct ? _list[i].correct : 0) / (_list[i].paper.question_number ? _list[i].paper.question_number : 1) * 100).toFixed(0)
            _per.push(percentage)
          }
          for (var i = 0; i < _per.length; i++) {
            this.drawCircleProgress('runCanvas_' + i, '#efefef', '#ff9900', 40, 40, 37, _per[i], _per[i] + '%', '40', '#333')
          }
          console.log(_per)
          this.setData({
            recordList: _recordList,
            per:_per,
            listpage:res.data.page
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
      data: { recent: recent, page: page, per_page: '15' },// 0全部，1最近一周，2最近一月
      header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + app.globalData.token },
    })
  },
  // 模拟考试获取答卷记录列表
  getTestrecord: function (recent, page) {
    api.getTestrecord({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          var _list = res.data.data;
          var _recordList = this.data.recordList;
          _recordList = _recordList.concat(_list)
          var _per = this.data.per;
          console.log(_list)
          for (var i = 0; i < _list.length; i++) {
            var percentage = parseFloat((_list[i].correct ? _list[i].correct : 0) / (_list[i].paper.question_number ? _list[i].paper.question_number : 1) * 100).toFixed(0)
            _per.push(percentage)
          }
          for (var i = 0; i < _per.length; i++) {
            this.drawCircleProgress('runCanvas_' + i, '#efefef', '#ff9900', 40, 40, 37, _per[i], _per[i] + '%', '40', '#333')
          }
          console.log(_per)
          this.setData({
            recordList: _recordList,
            per: _per,
            listpage: res.data.page
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
      data: { recent: recent, page: page, per_page: '15' },// 0全部，1最近一周，2最近一月
      header: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + app.globalData.token },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var t = this;
    t.getUserrecord('0',1)
    // for (var i = 0; i < this.data.per.length; i++) {
    //   this.drawCircleProgress('runCanvas_' + i, '#efefef', '#ff9900', 40, 40, 37, this.data.per[i], this.data.per[i] + '%', '40', '#333')
    // }
    

  },
  navChange(e) {
    this.setData({
      recordList: [],
      listpage: {},
      per: []
    })
    if (e.currentTarget.dataset.nav == '2'){//历年真题
      this.getUserrecord(this.data.timeindex, 1)
    } else if (e.currentTarget.dataset.nav == '3') {//模拟考试
      this.getTestrecord(this.data.timeindex, 1)
    }
    this.setData({
      navindex: e.currentTarget.dataset.nav
    })
  },
  timeChange(e) {
    this.setData({
      recordList: [],
      listpage: {},
      per: []
    })
    this.getUserrecord(e.currentTarget.dataset.nav, 1)
    this.setData({
      timeindex: e.currentTarget.dataset.nav
    })
  },
  moreFun:function(){
    this.getUserrecord(this.data.timeindex, this.data.listpage.current_page + 1)
  },
  urlresultsStatistical:function(e){
    var _recordList = this.data.recordList;
    //console.log(_recordList)
    for (var i = 0; i < _recordList.length; i++){
      if (_recordList[i].id == e.currentTarget.dataset.id){
        //console.log(_recordList[i])
        app.globalData.chioseRecordInfo = this.data.recordList[i];
        continue;
      }
    }
    app.globalData.testType = this.data.navindex;
    app.globalData.isstudydata = false;
    wx.navigateTo({
      url: '../resultsStatistical/resultsStatistical?record_id=' + e.currentTarget.dataset.id + '&navindex=' + this.data.navindex
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

  },
  drawCircleProgress:function (canvasId, backStrokeColor, strokeColor, x, y, radius, percent, text, fontSize, fontColor){
   var t= this;
    var cxt_arc = wx.createCanvasContext(canvasId);//创建并返回绘图上下文context对象。
    cxt_arc.setLineWidth(6);
    cxt_arc.setStrokeStyle(backStrokeColor);
    cxt_arc.setLineCap('round')
  cxt_arc.beginPath();//开始一个新的路径
    cxt_arc.arc(x, y, radius, 0, 2 * Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径
    cxt_arc.stroke();//对当前路径进行描边

    cxt_arc.setLineWidth(6);
    cxt_arc.setStrokeStyle(strokeColor);
    cxt_arc.setLineCap('round')
  cxt_arc.beginPath();//开始一个新的路径
    cxt_arc.arc(x, y, radius, -Math.PI / 2, 2 * Math.PI * (percent / 100) - Math.PI / 2, false);
    cxt_arc.stroke();//对当前路径进行描边

    var finalSize = fontSize / 2;
    cxt_arc.beginPath();
    // cxt_arc.setFontSize(finalSize);
    cxt_arc.setFillStyle(fontColor);
    cxt_arc.setTextAlign('center');
    cxt_arc.setTextBaseline('middle');
    cxt_arc.font = 'normal bold 20px sans-serif';
    cxt_arc.fillText(text, x, y);

    cxt_arc.draw();
  },
  
})