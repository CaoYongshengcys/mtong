App({
  onLaunch() {
    this.initLogin()
  },

  initLogin() {
    const demoUser = {
      nickName: '用户',
      avatarUrl: '/images/default_avatar.png',
      role: 'farmer'
    }
    const userInfo = wx.getStorageSync('userInfo') || demoUser
    wx.setStorageSync('userInfo', userInfo)
    this.globalData.userInfo = userInfo
  },

  checkUpdate() {
    // Disabled in demo mode to avoid system permission checks during real-device debugging.
  },

  globalData: {
    token: null,
    userInfo: null,
    baseUrl: 'https://api.mtong.com/api',
    demoMode: true,
    offlineQueue: []
  }
})
