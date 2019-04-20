// const services = "https://dev.shuati.exinghang.com/";//测试
// const services = "https://dns2.shuati.exinghang.com/";//正式
const services = "https://dns1.shuati.exinghang.com/";//正式
const status = {
  Reg: /^20[0123456789]$/,//判断接口返回状态是否为20开头
  s201: '201',//正常显示数据
  s402: '402',//显示错误信息，告知用户
  s203: '203',//删除成功
  s204: '204',//删除失败
  s301: '301',//需要后续操作
  s401: '401',//系统错误ß
  s403: '403',//敏感词
}
const datacode = {
  c200: '200'
}

/**
 * 封装请求方法
 * url  请求的接口地址
 * data 请求接口的数据
 * successFunc  请求成功后执行的方法
 * errorFunc    请求失败后执行的方法
 * method    默认为get
 * header    默认为{'content-type': 'application/json'}
 * loadingtxt   加载中显示的文案，默认加载中
 */

var requestNum = 0;
// function nRequest(url, data, successFunc, method, header, errorFunc, loadingtxt) {
function nRequest(url,params) {
  const header = params.header || { 'content-type': 'application/json' };
  const method = params.method || 'post';
  requestNum++;
  if (wx.showLoading) {
    if(!params.isshowLoading){
      wx.showLoading({
        title: params.loadingtxt || '加载中',
        mask: true
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 3000)
    }
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
  wx.request({
    url: url, //仅为示例，并非真实的接口地址
    method: method,
    data: params.data || '',
    header: header,
    success: (res) => {
      params.success && params.success(res);
      requestNum--;
      if (requestNum == 0) {
        wx.hideLoading();
      }
    },
    fail: (res) => {
      params.fail && params.fail(res);
      wx.showToast({
        title: '网络请求失败',
        icon: 'fail',
        duration: 2000
      })
      requestNum--;
      if (requestNum == 0) {
        wx.hideLoading();
      }
    },
    complete: (res) => {
      params.complete && params.complete(res);
    }
    // success: function (res) {
    //   successFunc(res);
    //   requestNum--;
    //   if (requestNum == 0) {
    //     wx.hideLoading();
    //   }
    // },
    // fail: function (err) {
    //   wx.showToast({
    //     title: '网络请求失败',
    //     icon: 'fail',
    //     duration: 2000
    //   })
    //   errorFunc(err);
    //   requestNum--;
    //   if (requestNum == 0) {
    //     wx.hideLoading();
    //   }
    // },
    // complete: function (e) {
    //   // console.log(e)
    // }
  })
};

// 接口管理处
// index
// const getHpIdList = (params) => nRequest(services + 'api/cert/gethotcerts', params);
// // test
// const getNewsDetails = (params) => nRequest(services + 'api/news/getnewsdetail', params);

// authorization
//授权/登录
const getAuthorization = (params) => nRequest(services + 'api/login', params);

// typeSelection
//科目列表
const getSubjectList = (params) => nRequest(services + 'api/subject/index', params);
// 保存用户所选科目
const saveSubjectId = (params) => nRequest(services + 'api/subject/store', params);

// index
// 首页数据初始化
const indexInfo = (params) => nRequest(services + 'api/init', params);
// 获取在学科目
const getHassubjects = (params) => nRequest(services + 'api/subject/hassubjects', params);

// chapterLists
// 课程学习--章节列表
const getChapterList = (params) => nRequest(services + 'api/chapter/index', params);
// 获取要点列表
const getpointsList = (params) => nRequest(services + 'api/chapter/getpoints', params);
// 获取用户已学章节信息
const getlearnedChapters = (params) => nRequest(services + 'api/chapter/getlearnedchapters', params);
// 获取用户已解锁章节
const getunlockedChapters = (params) => nRequest(services + 'api/chapter/getunlockedchapters', params);

// mainPointsDetails
// 获取要点详情
const getpointContent = (params) => nRequest(services + 'api/chapter/getpointcontent', params);
// 标记是否掌握
const markMastered = (params) => nRequest(services + 'api/chapter/markmastered', params);
// 标记为已学
const markLearned = (params) => nRequest(services + 'api/chapter/marklearned', params);

// list
// 统计各章答题数据
const getAnswercount = (params) => nRequest(services + 'api/exercise/getanswercount', params);
// 获取各章节试题数量
const getCount = (params) => nRequest(services + 'api/exercise/getcount', params);

// 历年真题
// 获取试卷列表
const getPapers = (params) => nRequest(services + 'api/paper/getpapers', params);
// 获取答卷记录列表
const getUserrecord = (params) => nRequest(services + 'api/paper/getuserrecord', params);
// 获取用户答卷最新记录
const getNewestpapers = (params) => nRequest(services + 'api/paper/getnewestpapers', params);
// 获取试卷选择题
const getPaperchoice = (params) => nRequest(services + 'api/paper/getchoice', params);
// 获取试卷全部试题id
const getPapersheet = (params) => nRequest(services + 'api/paper/getsheet', params);
// 获取试卷答题卡
const getPapersheetdone = (params) => nRequest(services + 'api/paper/getpapersheet', params);
// 记录答题结果
const commitPaperAnswer = (params) => nRequest(services + 'api/paper/commitanswer', params);
// 获取新的答卷id
const getrecordid = (params) => nRequest(services + 'api/paper/getrecordid', params);
// 获取选择题最后一题的题号
const getlastsort = (params) => nRequest(services + 'api/paper/getlastsort', params);
// 获取试卷非选择题
const getPaperquestion = (params) => nRequest(services + 'api/paper/getquestion', params);
// 获取试卷结果
const getPaperresult = (params) => nRequest(services + 'api/paper/getpaperresult', params);
// 历年真题获取上次答题信息
const getlastquestion = (params) => nRequest(services + 'api/paper/getlastquestion', params);
// 错题解析
const geterrors = (params) => nRequest(services + 'api/paper/geterrors', params);

// exercises
// 获取章节练习选择题
const getChoices = (params) => nRequest(services + 'api/exercise/getchoices', params);
// 获取章节练习非选择题
const getQuestions = (params) => nRequest(services + 'api/exercise/getquestions', params);
// 提交答题结果
const commitAnswer = (params) => nRequest(services + 'api/question/commitanswer', params);

// sheet
// 获取章内所有试题的id（答题中的答题卡）
const getSheet = (params) => nRequest(services + 'api/exercise/getsheet', params);
// 获取答题卡
const getAnswersheet = (params) => nRequest(services + 'api/exercise/getanswersheet', params);

// 获取例题
const getexamples = (params) => nRequest(services + 'api/exercise/getexamples', params);



// 模拟考试
// 获取模拟考试试卷列表
const getTestPapers = (params) => nRequest(services + 'api/mock/getpapers', params);
// 获取用户答卷最新记录
const getTestnews = (params) => nRequest(services + 'api/mock/getnewestpapers', params);
// 获取新的答卷id
const getTestrecordid = (params) => nRequest(services + 'api/mock/getrecordid', params);
// 获取选择题最后一题的题号
const getTestlastsort = (params) => nRequest(services + 'api/mock/getlastsort', params);
// 获取选择题
const getTestchoice = (params) => nRequest(services + 'api/mock/getchoice', params);
// 获取非选择题
const getTestquestion = (params) => nRequest(services + 'api/mock/getquestion', params);
// 获取答卷记录列表
const getTestrecord = (params) => nRequest(services + 'api/mock/getuserrecord', params);
// 获取试卷结果
const getTestpaperresult = (params) => nRequest(services + 'api/mock/getpaperresult', params);
// 记录答题结果
const getTestcommitanswer = (params) => nRequest(services + 'api/mock/commitanswer', params);
// 获取试卷答题卡
const getTestpapersheetdone = (params) => nRequest(services + 'api/mock/getpapersheet', params);
// 获取试卷全部试题id
const getTestpapersheet = (params) => nRequest(services + 'api/mock/getsheet', params);
// 模拟考试获取上次答题信息
const getTestlastquestion = (params) => nRequest(services + 'api/mock/getlastquestion', params);
// 错题解析
const getmockerrors = (params) => nRequest(services + 'api/mock/geterrors', params);


// 收藏或取消收藏 试题
const favoriteQuestion = (params) => nRequest(services + 'api/question/favorite', params);
// 记录用户学习时间数据
const recordtime = (params) => nRequest(services + 'api/question/recordtime', params);


// 个人中心
// 获取错题统计概览
const getsummary = (params) => nRequest(services + 'api/wrong/getsummary', params);
// 获取章节练习错误章节列表
const getexercisewrong = (params) => nRequest(services + 'api/wrong/getexercisewrong', params);
// 获取历年真题错误试卷列表
const getpaperwrong = (params) => nRequest(services + 'api/wrong/getpaperwrong', params);
// 获取模拟考试错误试卷列表
const getmockwrong = (params) => nRequest(services + 'api/wrong/getmockwrong', params);
// 获取题目收藏统计概览
const getCollectionSummary = (params) => nRequest(services + 'api/favorite/getsummary', params);
// 获取收藏的章节练习的试题
const getChapterSummary = (params) => nRequest(services + 'api/favorite/getchapter', params);
// 获取收藏的历年真题的试题
const getPaperSummary = (params) => nRequest(services + 'api/favorite/getpaper', params);
// 获取收藏的模拟考试的试题
const getMockSummary = (params) => nRequest(services + 'api/favorite/getmock', params);
// 获取错题
const getWrongList = (params) => nRequest(services + 'api/wrong/getchoice', params);
// 删除错题
const deleteWrongchoice = (params) => nRequest(services + 'api/wrong/deletechoice', params);
// 获取用户资料
const getUserInfo = (params) => nRequest(services + 'api/profile/show', params);
// 更新用户资料
const updateUserInfo = (params) => nRequest(services + 'api/profile/update', params);
// 获取关于我们
const getaboutus = (params) => nRequest(services + 'api/mina/getaboutus', params);
// 获取微信群二维码
const getgroupqr = (params) => nRequest(services + 'api/mina/getgroupqr', params);
// 获取收藏试题的ids
const getids = (params) => nRequest(services + 'api/favorite/getids', params);
// 根据id获取一道选择题
const getchoicebyid = (params) => nRequest(services + 'api/question/getchoicebyid', params);
// 根据id获取一道非选择题
const getquestionbyid = (params) => nRequest(services + 'api/question/getquestionbyid', params);

// 学习数据
// 获取学习报告
const getreport = (params) => nRequest(services + 'api/data/getreport', params);
// 获取雷达图数据
const getradarmap = (params) => nRequest(services + 'api/data/getradarmap', params);

// 获取分享设置
const getsetting = (params) => nRequest(services + 'api/share/getsetting', params);
// 获取助力记录
const gethelprecord = (params) => nRequest(services + 'api/share/gethelprecord', params);
// 记录助力信息
const recordhelp = (params) => nRequest(services + 'api/share/recordhelp', params);
// 获取助力试卷的信息
const gethelpedpaper = (params) => nRequest(services + 'api/share/gethelpedpaper', params);
// 获取水平测试卷id
const getlevelpaperid = (params) => nRequest(services + 'api/data/getlevelpaperid', params);
// 获取随机试卷
const generatepaper = (params) => nRequest(services + 'api/share/generatepaper', params);
// 获取随机试卷试题
const getLevelquestions = (params) => nRequest(services + 'api/share/getquestions', params);
// 获取答卷记录
const getanswerrecord = (params) => nRequest(services + 'api/share/getanswerrecord', params);
// 随机出卷
const makepaper = (params) => nRequest(services + 'api/share/makepaper', params);
// 提交答题结果
const commitanswerlevet = (params) => nRequest(services + 'api/share/commitanswer', params);
// 获取答题卡
const levelpapergetsheet = (params) => nRequest(services + 'api/share/getsheet', params);
// 解锁试卷
const unlockpaper = (params) => nRequest(services + 'api/share/unlockpaper', params);
// 水平测试记录答题时间
const recordleveltime = (params) => nRequest(services + 'api/share/recordtime', params);



// 解密用户手机号
const getmobile = (params) => nRequest(services + 'api/profile/getmobile', params);
// 获取记忆卡
const getmemorycard = (params) => nRequest(services + 'api/chapter/getmemorycard', params);
// 获取答卷结果
const getscore = (params) => nRequest(services + 'api/share/getscore', params);


module.exports = {
  services: services,
  status: status,
  datacode: datacode,
  nRequest: nRequest,
  getAuthorization: getAuthorization,
  getSubjectList: getSubjectList,
  saveSubjectId: saveSubjectId,
  indexInfo: indexInfo,
  getHassubjects: getHassubjects,
  getChapterList: getChapterList,
  getpointsList: getpointsList,
  getlearnedChapters: getlearnedChapters,
  getunlockedChapters: getunlockedChapters,
  getpointContent: getpointContent,
  markMastered: markMastered,
  markLearned: markLearned,
  getAnswercount: getAnswercount,
  getCount: getCount,
  getChoices: getChoices,
  getQuestions: getQuestions,
  commitAnswer: commitAnswer,
  getAnswersheet: getAnswersheet,
  getSheet: getSheet,
  favoriteQuestion: favoriteQuestion,
  getPapers: getPapers,
  getUserrecord: getUserrecord,
  getNewestpapers: getNewestpapers,
  getPaperchoice: getPaperchoice,
  getPapersheet: getPapersheet,
  commitPaperAnswer: commitPaperAnswer,
  getrecordid: getrecordid,
  getlastsort: getlastsort,
  getPaperquestion: getPaperquestion,
  getPapersheetdone: getPapersheetdone,
  getPaperresult: getPaperresult,
  getTestPapers: getTestPapers,
  getexamples: getexamples,
  getsummary: getsummary,
  getexercisewrong: getexercisewrong,
  getpaperwrong: getpaperwrong,
  getmockwrong: getmockwrong,
  getCollectionSummary: getCollectionSummary,
  getChapterSummary: getChapterSummary,
  getPaperSummary: getPaperSummary,
  getMockSummary: getMockSummary,
  getWrongList: getWrongList,
  deleteWrongchoice: deleteWrongchoice,
  getUserInfo: getUserInfo,
  updateUserInfo: updateUserInfo,
  getaboutus: getaboutus,
  getgroupqr: getgroupqr,
  getids: getids,
  getchoicebyid: getchoicebyid,
  getquestionbyid: getquestionbyid,
  getTestnews: getTestnews,
  getTestrecordid: getTestrecordid,
  getTestlastsort: getTestlastsort,
  getTestchoice: getTestchoice,
  getTestquestion: getTestquestion,
  recordtime: recordtime,
  getTestrecord: getTestrecord,
  getTestpaperresult: getTestpaperresult,
  getTestcommitanswer: getTestcommitanswer,
  getTestpapersheet: getTestpapersheet,
  getTestpapersheetdone: getTestpapersheetdone,
  getreport: getreport,
  getmobile: getmobile,
  getradarmap: getradarmap,
  generatepaper: generatepaper,
  getsetting: getsetting,
  gethelprecord: gethelprecord,
  recordhelp: recordhelp,
  gethelpedpaper: gethelpedpaper,
  getlevelpaperid: getlevelpaperid,
  getLevelquestions: getLevelquestions,
  getanswerrecord: getanswerrecord,
  makepaper: makepaper,
  commitanswerlevet: commitanswerlevet,
  levelpapergetsheet: levelpapergetsheet,
  unlockpaper: unlockpaper,
  getmemorycard: getmemorycard,
  getlastquestion: getlastquestion,
  getTestlastquestion: getTestlastquestion,
  geterrors: geterrors,
  getmockerrors: getmockerrors,
  recordleveltime: recordleveltime,
  getscore: getscore,

  // getHpIdList: getHpIdList,
  // getNewsDetails: getNewsDetails
}
// 页面注释
// index——首页
// authorization——授权登录
// center——个人中心
// chapterLists——课程章节学习列表
// exercises——例题
// studyData——学习数据
// typeSelection——选择考证类型
// mainPointsDetails——要点详情
//resultsStatistical——成绩统计
// sheet——答题卡
// list——列表（章节练习列表，历年真题列表，模拟试卷列表）
// editInformation——编辑个人信息
// wrongTopic——错题本
// wrongTopicList——错题本（章节练习，历年真题，模拟考试列表）
// memo——备忘录
// collection——题目收藏（跟wrongTopic——错题本页面一样）
// record——做题成绩记录
// 题目收藏的题目页面