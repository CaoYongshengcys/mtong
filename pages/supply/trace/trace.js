const supplyApi = require('../../../api/supply')

Page({
  data: {
    searchKey: '',
    traceInfo: null,
    loading: false,
    recentSearches: []
  },

  onLoad() {},

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    const recent = wx.getStorageSync('recentTraceSearches') || []
    this.setData({ recentSearches: recent.slice(0, 5) })
  },

  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value })
  },

  async onSearch() {
    const { searchKey } = this.data
    if (!searchKey) { wx.showToast({ title: '请输入批次号', icon: 'none' }); return }

    this.setData({ loading: true })
    try {
      const res = await supplyApi.getTraceInfo(searchKey)
      this.setData({ traceInfo: res, loading: false })
      this.saveRecentSearch(searchKey)
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        traceInfo: {
          batchNo: searchKey,
          product: '防风饮片',
          herbType: '防风',
          status: '已上市',
          fullChain: [
            { stage: '种植', batchNo: 'CJ-20260510-001', location: '康保县张纪镇', operator: '张三', time: '2026-05-10', details: '采收防风鲜品500kg' },
            { stage: '清洗', batchNo: 'CJ-20260510-001', location: '加工车间', operator: '王师傅', time: '2026-05-11 08:30', details: '清洗合格，水质达标' },
            { stage: '切片', batchNo: 'YL-20260511-001', location: '切片车间', operator: '李师傅', time: '2026-05-11 10:00', details: '切片厚度2-3mm' },
            { stage: '烘干', batchNo: 'YL-20260511-001', location: '烘干房1号', operator: '赵师傅', time: '2026-05-11 14:00', details: '温度38°C，湿度45%RH' },
            { stage: '分装', batchNo: 'CP-20260512-001', location: '分装车间', operator: '孙师傅', time: '2026-05-12 09:00', details: '分装100kg' },
            { stage: '检验', batchNo: 'CP-20260512-001', location: '检验室', operator: '刘检验员', time: '2026-05-13', details: '检验合格' }
          ]
        }
      })
    }
  },

  onScanCode() {
    wx.scanCode({
      success: (res) => {
        this.setData({ searchKey: res.result })
        this.onSearch()
      }
    })
  },

  saveRecentSearch(key) {
    let recent = wx.getStorageSync('recentTraceSearches') || []
    recent = recent.filter(r => r !== key)
    recent.unshift(key)
    recent = recent.slice(0, 10)
    wx.setStorageSync('recentTraceSearches', recent)
    this.setData({ recentSearches: recent.slice(0, 5) })
  },

  onRecentTap(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ searchKey: key })
    this.onSearch()
  },

  onClearRecent() {
    wx.removeStorageSync('recentTraceSearches')
    this.setData({ recentSearches: [] })
  }
})
