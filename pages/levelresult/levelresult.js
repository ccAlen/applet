// pages/resultsStatistical/resultsStatistical.js
const app = getApp()
const api = require('../../api/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    testType:'1',
    chapterCard:{},//章节练习答题卡信息
    h1isshow: false,
    chioseRecordInfo:{},//做题记录进来，选择的记录信息
    //控制progress
    count: 0, // 设置 计数器 初始为0
    countTimer: null,// 设置 定时器
    progress_txt: 50,// 提示文字
    // isshowselect: false,
    result:{},
    sheetList:{},
    paperInfo:{},
    record_id:'',
    navindex:'',
    isstudydata:false,
    paper_id:'',
    levelsheetList:[]
  },
  slideDown: function (e) {
    this.setData({
      h1isshow: !this.data.h1isshow
    })
  },
  urlBack:function(){
    wx.reLaunch({
      url: '../studyData/studyData'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)

    var t = this;
    t.setData({
      paper_id: options.paperid,
      papertitle:options.papername
    })
    // t.setData({
    //   testType: app.globalData.testType,
    //   record_id: options.record_id,
    //   navindex: options.navindex ? options.navindex : '',
    //   isstudydata: options.isstudydata ? options.isstudydata : false
    // })
    t.getscore(options.paperid)
    t.getsheet(options.paperid)
    
    // t.getPapersheetdone(options.record_id);
    // 学习进度环形图
    //绘制背景
    t.drawProgressbg();
    //开始progress
    //参数在0——60之间，60为一圈
    // t.startProgress(parseFloat(t.data.progress_txt) / 100 * 60);
  },
  
  // 获取试卷结果
  getscore: function (paper_id){
    api.getscore({
      success: (result) => {
        if (api.status.Reg.test(result.statusCode)) {
          console.log(result)
          var _progress_txt = parseFloat(result.data.data.correct / (result.data.data.total == '0' ? '1' : result.data.data.total)).toFixed(2) * 100;
          this.setData({
            result: result.data.data,
            progress_txt: _progress_txt
          })
          //参数在0——60之间，60为一圈
          this.startProgress(parseFloat(_progress_txt) / 100 * 60);
          console.log(_progress_txt)
        } else {
          wx.showToast({
            title: result.message,
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
 
  // 获取历年真题试卷答题卡
  getsheet: function (paper_id) {
    api.levelpapergetsheet({
      success: (res) => {
        if (api.status.Reg.test(res.statusCode)) {
          const _ananswersheet = res.data.data;
          console.log(_ananswersheet)
          // for(var i = 0;i<_ananswersheet.length;i++){
          //   _ananswersheet[i].correct = 0
          // }
          this.setData({
            levelsheetList: _ananswersheet,
            // islevelpaper: true,
            // ispaper: true,
            // levelpapertitle: options.papername,
            // paper_id: options.levelpaperid
          })
          // if (_sheetList.length > 0) {
          //   for (var j = 0; j < _sheetList.length; j++) {
          //     for (var row in _ananswersheet) {
          //       if (row == _sheetList.id) {
          //         _sheetList[j].haddone = '1',
          //         _sheetList[j].isCorrect = _ananswersheet.choice[row]
          //       }
          //     }
          //   }
          //   var _sheet = this.data.sheetList;
          //   _sheet.choice = _sheetList;
          //   t.setData({
          //     sheetList: _sheet
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
        paper_id: paper_id
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
    })
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
  * 画progress底部背景
  */
  drawProgressbg: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    var ctx = wx.createCanvasContext('canvasProgressbg')
    // 设置圆环的宽度
    ctx.setLineWidth(5);
    // 设置圆环的颜色
    ctx.setStrokeStyle('#efefef');
    // 设置圆环端点的形状
    ctx.setLineCap('round')
    //开始一个新的路径
    ctx.beginPath();
    //设置一个原点(60,60)，半径为100的圆的路径到当前路径
    ctx.arc(82.5, 82.5, 65, 0, 2 * Math.PI, false);
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
    context.setLineWidth(15);
    // 设置圆环的颜色
    context.setStrokeStyle('#ffa005');
    // const grd = context.createLinearGradient(0, 0, 200, 0)
    // grd.addColorStop(0, 'red')
    // grd.addColorStop(1, 'white')
    // context.setFillStyle(grd)
    
    // 设置圆环端点的形状
    context.setLineCap('round')
    //开始一个新的路径
    context.beginPath();
    //参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(82.5, 82.5, 65, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
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
    }, 20)
  },
  
})