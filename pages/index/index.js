Page({
  data: {
    userInfo: {
      nickName: '用户',
      avatarUrl: '/images/default_avatar.png'
    },
    todayStats: {
      diaryCount: 0,
      batchCount: 0,
      alarmCount: 0,
      inspectCount: 0
    },
    todoList: [],
    recentAlarms: [],
    weatherInfo: null,
    offlineCount: 0
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.refreshStats()
    this.checkOfflineData()
  },

  onPullDownRefresh() {
    this.refreshStats().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  initPage() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo: {
        nickName: userInfo.nickName || '用户',
        avatarUrl: userInfo.avatarUrl || '/images/default_avatar.png'
      }
    })
    this.loadDemoData()
  },

  refreshStats() {
    this.loadDemoData()
    return Promise.resolve()
  },

  loadDemoData() {
    this.setData({
      todayStats: { diaryCount: 3, batchCount: 2, alarmCount: 1, inspectCount: 0 },
      todoList: [
        { id: 1, title: '黄芪地块A-3需施肥', type: 'plant', typeLabel: '种植', time: '09:00' },
        { id: 2, title: '批次CJ-20260510-001待切片', type: 'process', typeLabel: '加工', time: '10:30' },
        { id: 3, title: '防风成品待检验', type: 'quality', typeLabel: '质检', time: '14:00' }
      ],
      recentAlarms: [
        { id: 1, deviceName: '烘干房1号', message: '温度超标 42C', time: '08:30', level: 'danger', dotClass: 'status-dot-alarm' }
      ]
    })
  },

  checkOfflineData() {
    const queue = wx.getStorageSync('offlineQueue') || []
    this.setData({ offlineCount: queue.length })
    if (queue.length > 0) {
      const { syncOfflineRequests } = require('../../utils/request')
      syncOfflineRequests().then(() => {
        this.setData({ offlineCount: 0 })
      })
    }
  },

  navigateTo(e) {
    const { url } = e.currentTarget.dataset
    wx.navigateTo({ url })
  },

  switchToTab(e) {
    const { url } = e.currentTarget.dataset
    wx.switchTab({ url })
  },

  onTodoTap(e) {
    const { id, type } = e.currentTarget.dataset
    const routes = {
      plant: '/pages/plant/diary/diary',
      process: '/pages/process/batch/batch',
      quality: '/pages/quality/inspect-task/inspect-task',
      supply: '/pages/supply/compliance/compliance'
    }
    wx.switchTab({ url: routes[type] || routes.plant })
  },

  onAlarmTap(e) {
    wx.navigateTo({ url: '/pages/process/iot-monitor/iot-monitor' })
  }
})
