const processApi = require('../../../api/process')
const { BATCH_STATUS, PROCESS_STATIONS, HERB_TYPES } = require('../../../utils/constants')

Page({
  data: {
    batchList: [],
    batchStatus: BATCH_STATUS,
    currentFilter: 'all',
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {},

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.refreshList()
  },

  onPullDownRefresh() {
    this.refreshList().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) this.loadMore()
  },

  async refreshList() {
    this.setData({ page: 1, hasMore: true, batchList: [] })
    return this.loadBatchList()
  },

  async loadBatchList() {
    this.setData({ loading: true })
    try {
      const params = { page: this.data.page, pageSize: 20 }
      if (this.data.currentFilter !== 'all') params.status = this.data.currentFilter
      const res = await processApi.getBatchList(params)
      const list = (res.list || []).map(item => {
        const status = BATCH_STATUS.find(s => s.value === item.status)
        return Object.assign({}, item, {
          statusLabel: status ? status.label : item.status,
          statusTagClass: status ? status.tagClass : 'tag-blue'
        })
      })
      this.setData({
        batchList: this.data.page === 1 ? list : this.data.batchList.concat(list),
        hasMore: list.length >= 20,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      this.loadMockData()
    }
  },

  loadMockData() {
    this.setData({
      batchList: [
        { id: '1', batchNo: 'CJ-20260510-001', batchType: 'primary', product: '防风（鲜）', quantity: 500, unit: 'kg', status: 'processing', statusLabel: '加工中', statusTagClass: 'tag-blue', currentStation: 'slice', createTime: '2026-05-10' },
        { id: '2', batchNo: 'YL-20260508-003', batchType: 'material', product: '黄芪（切片）', quantity: 200, unit: 'kg', status: 'pending', statusLabel: '待处理', statusTagClass: 'tag-orange', currentStation: '', createTime: '2026-05-08' },
        { id: '3', batchNo: 'CP-20260505-002', batchType: 'product', product: '柴胡饮片', quantity: 100, unit: 'kg', status: 'completed', statusLabel: '已完成', statusTagClass: 'tag-green', currentStation: '', createTime: '2026-05-05' }
      ],
      hasMore: false
    })
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 })
    this.loadBatchList()
  },

  onFilterTap(e) {
    const { status } = e.currentTarget.dataset
    this.setData({ currentFilter: status, page: 1 })
    this.refreshList()
  },

  onBatchTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/process/batch-detail/batch-detail?id=${id}` })
  },

  onCreateBatch() {
    wx.navigateTo({ url: '/pages/process/batch-detail/batch-detail?type=create' })
  },

  onScanCode() {
    wx.scanCode({
      success: (res) => {
        processApi.scanWorkstation({ code: res.result }).then(data => {
          wx.navigateTo({ url: `/pages/process/batch-detail/batch-detail?id=${data.batchId}&station=${data.station}` })
        }).catch(() => {
          wx.showToast({ title: '无效的工位码', icon: 'none' })
        })
      }
    })
  }
})
