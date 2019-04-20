Date.prototype.format = function (fmt) { //author: meizz   
  var o = {
    "M+": this.getMonth() + 1,                 //月份   
    "d+": this.getDate(),                    //日   
    "h+": this.getHours(),                   //小时   
    "m+": this.getMinutes(),                 //分   
    "s+": this.getSeconds(),                 //秒   
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function timer() {
  this.propsThis = "";//父级this
  this.currentTime = 0;//当前时间
  this.interval = "";//循环对象
  this.callback;//回调方法
}

timer.prototype = {
  setCallback: function (callback) {
    this.callback = callback;
    return this;
  },
  setTime: function (time) {
    this.currentTime = time;
    return this;
  },
  start: function () {
    this.stop();
    this.interval = setInterval(() => {
      this.currentTime++;
      this.callback && this.callback(this.format());
    }, 1000);
  },
  stop: function () {
    clearInterval(this.interval);
  },
  getMinutes: function () {
    return parseInt(this.currentTime / 60);
  },
  format: function () {
    return new Date(this.currentTime * 1000).format("HH:mm:ss").replace("HH", "00");
  }
}

/**
 * 计时器
 */
function createTimer() {
  return new timer();
}

module.exports = {
  createTimer,
}