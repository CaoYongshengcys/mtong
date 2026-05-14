const qualityApi = require('../../../api/quality')
const { INSPECT_TYPES, INSPECT_STATUS } = require('../../../utils/constants')

Page({
  data: {
    taskList: [],
    inspectTypes: INSPECT_TYPES,
    inspectStatus: INSPECT_STATUS,
    currentFilter: 'all',
    loading: false
  },

  onLoad() {},

  onShow() {
    this.loadTaskList()
  },

  onPullDownRefresh() {
    this.loadTaskList().then(() => wx.stopPullDownRefresh())
  },

  async loadTaskList() {
    this.setData({ loading: true })
    try {
      const params = {}
      if (this.data.currentFilter !== 'all') params.status = this.data.currentFilter
      const res = await qualityApi.getInspectTaskList(params)
      const list = (res.list || []).map(item => {
        const status = INSPECT_STATUS.find(s => s.value === item.status)
        const type = INSPECT_TYPES.find(t => t.value === item.inspectType)
        return Object.assign({}, item, {
          statusLabel: status ? status.label : item.status,
          statusTagClass: status ? status.tagClass : 'tag-blue',
          typeLabel: type ? type.label : item.inspectType
        })
      })
      this.setData({ taskList: list, loading: false })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        taskList: [
          { id: '1', sampleNo: 'YP-20260511-001', batchNo: 'CP-20260505-002', productName: '柴胡饮片', inspectType: 'physical', typeLabel: '理化指标', status: 'pending', statusLabel: '待检验', statusTagClass: 'tag-orange', createTime: '2026-05-11' },
          { id: '2', sampleNo: 'YP-20260510-003', batchNo: 'CP-20260505-002', productName: '柴胡饮片', inspectType: 'content', typeLabel: '含量测定', status: 'testing', statusLabel: '检验中', statusTagClass: 'tag-blue', createTime: '2026-05-10' },
          { id: '3', sampleNo: 'YP-20260508-002', batchNo: 'CP-20260505-001', productName: '防风饮片', inspectType: 'microbial', typeLabel: '微生物限度', status: 'passed', statusLabel: '合格', statusTagClass: 'tag-green', createTime: '2026-05-08' }
        ]
      })
    }
  },

  onFilterTap(e) {
    const { status } = e.currentTarget.dataset
    this.setData({ currentFilter: status })
    this.loadTaskList()
  },

  onTaskTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/quality/inspect-report/inspect-report?taskId=${id}` })
  },

  onCreateTask() {
    wx.navigateTo({ url: '/pages/quality/inspect-report/inspect-report?type=create' })
  }
})
