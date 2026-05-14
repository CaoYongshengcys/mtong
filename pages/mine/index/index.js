const authApi = require('../../../api/auth')
const { ROLES } = require('../../../utils/constants')
const { syncOfflineRequests } = require('../../../utils/request')

Page({
  data: {
    userInfo: {
      nickName: '未登录',
      avatarUrl: '/images/default_avatar.png'
    },
    roleLabel: '',
    menuList: [
      { title: '农资管理', icon: '🧪', url: '/pages/plant/archive/archive' },
      { title: '检验报告', icon: '📋', url: '/pages/quality/inspect-report/inspect-report' },
      { title: '合规报告', icon: '📊', url: '/pages/supply/compliance/compliance' },
      { title: '审计日志', icon: '📝', url: '/pages/process/e-record/e-record' },
      { title: '透明工厂', icon: '📹', url: '/pages/supply/factory/factory' }
    ],
    offlineCount: 0,
    systemInfo: ''
  },

  onLoad() {},

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }
    const storageUserInfo = wx.getStorageSync('userInfo') || {}
    const userInfo = {
      nickName: storageUserInfo.nickName || '未登录',
      avatarUrl: storageUserInfo.avatarUrl || '/images/default_avatar.png',
      role: storageUserInfo.role || ''
    }
    const role = ROLES.find(r => r.value === userInfo.role)
    this.setData({
      userInfo,
      roleLabel: role ? role.label : '未设置',
      offlineCount: (wx.getStorageSync('offlineQueue') || []).length
    })
  },

  onMenuTap(e) {
    const { url } = e.currentTarget.dataset
    wx.navigateTo({ url })
  },

  async onSyncOffline() {
    if (this.data.offlineCount === 0) return
    try {
      await syncOfflineRequests()
      this.setData({ offlineCount: 0 })
    } catch (e) {
      wx.showToast({ title: '同步失败', icon: 'none' })
    }
  },

  onEditProfile() {
    wx.navigateTo({ url: '/pages/mine/index/index?action=edit' })
  },

  onAbout() {
    wx.showModal({
      title: '关于系统',
      content: '码码通中药材全产业链追溯系统\n版本：V1.0.0\n适用：河北好药中药饮片科技有限公司',
      showCancel: false
    })
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      success: async (res) => {
        if (res.confirm) {
          try {
            await authApi.logout()
          } catch (e) {}
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.reLaunch({ url: '/pages/index/index' })
        }
      }
    })
  }
})
