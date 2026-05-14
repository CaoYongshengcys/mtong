const supplyApi = require('../../../api/supply')

Page({
  data: {
    videoList: [],
    vlogList: [],
    activeTab: 'live',
    loading: false
  },

  onLoad() {},

  onShow() {
    this.loadVideoList()
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
    if (this.data.activeTab === 'vlog') {
      this.loadVlogList()
    }
  },

  async loadVideoList() {
    this.setData({ loading: true })
    try {
      const res = await supplyApi.getVideoList({})
      this.setData({ videoList: res.list || [], loading: false })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        videoList: [
          { id: '1', name: '清洗车间', deviceId: 'cam-001', online: true, thumbnail: '' },
          { id: '2', name: '切片车间', deviceId: 'cam-002', online: true, thumbnail: '' },
          { id: '3', name: '烘干房1号', deviceId: 'cam-003', online: true, thumbnail: '' },
          { id: '4', name: '分装车间', deviceId: 'cam-004', online: false, thumbnail: '' }
        ]
      })
    }
  },

  async loadVlogList() {
    try {
      const res = await supplyApi.getVideoList({ type: 'vlog' })
      this.setData({ vlogList: res.list || [] })
    } catch (e) {
      this.setData({
        vlogList: [
          { id: '1', title: '防风饮片生产全过程', batchNo: 'CP-20260512-001', duration: '2:30', createTime: '2026-05-12', shared: false },
          { id: '2', title: '黄芪饮片加工记录', batchNo: 'CP-20260508-003', duration: '1:45', createTime: '2026-05-08', shared: true }
        ]
      })
    }
  },

  async onVideoTap(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showLoading({ title: '加载视频流...' })
    try {
      const res = await supplyApi.getVideoStream(id)
      wx.hideLoading()
      wx.showModal({
        title: name,
        content: '视频流播放需集成live-player组件，当前为演示模式',
        showCancel: false
      })
    } catch (e) {
      wx.hideLoading()
      wx.showModal({
        title: name,
        content: '视频流播放需集成live-player组件，当前为演示模式',
        showCancel: false
      })
    }
  },

  async onCaptureSnapshot(e) {
    const { id } = e.currentTarget.dataset
    try {
      await supplyApi.captureSnapshot(id)
      wx.showToast({ title: '截图成功', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '截图失败', icon: 'none' })
    }
  },

  async onGenerateVlog() {
    wx.showModal({
      title: '生成溯源Vlog',
      content: '将基于批次号自动聚合视频片段，添加字幕和背景音乐',
      editable: true,
      placeholderText: '请输入批次号',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await supplyApi.generateVlog({ batchNo: res.content })
            wx.showToast({ title: 'Vlog生成中...', icon: 'success' })
          } catch (e) {
            wx.showToast({ title: '生成失败', icon: 'none' })
          }
        }
      }
    })
  },

  async onShareVlog(e) {
    const { id } = e.currentTarget.dataset
    try {
      await supplyApi.shareVlog(id)
      wx.showToast({ title: '分享链接已生成', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '分享失败', icon: 'none' })
    }
  }
})
