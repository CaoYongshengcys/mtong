const processApi = require('../../../api/process')

Page({
  data: {
    recordList: [],
    auditTrailList: [],
    activeTab: 'records',
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {},

  onShow() {
    this.refreshList()
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab, page: 1 })
    this.refreshList()
  },

  async refreshList() {
    this.setData({ page: 1, hasMore: true, recordList: [], auditTrailList: [] })
    if (this.data.activeTab === 'records') {
      this.loadRecords()
    } else {
      this.loadAuditTrail()
    }
  },

  async loadRecords() {
    this.setData({ loading: true })
    try {
      const res = await processApi.getERecordList({ page: this.data.page, pageSize: 20 })
      this.setData({
        recordList: res.list || [],
        hasMore: (res.list || []).length >= 20,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        recordList: [
          { id: '1', title: '防风清洗记录', batchNo: 'CJ-20260510-001', formType: 'wash', operator: '王师傅', operateTime: '2026-05-11 08:30', status: 'submitted', statusLabel: '已提交', statusClass: 'tag-blue', ip: '192.168.1.100', deviceFingerprint: 'WX-A8F2' },
          { id: '2', title: '防风切片记录', batchNo: 'CJ-20260510-001', formType: 'slice', operator: '李师傅', operateTime: '2026-05-11 10:00', status: 'approved', statusLabel: '已审批', statusClass: 'tag-green', ip: '192.168.1.101', deviceFingerprint: 'WX-B3C1' },
          { id: '3', title: '黄芪烘干记录', batchNo: 'YL-20260508-003', formType: 'dry', operator: '赵师傅', operateTime: '2026-05-11 14:00', status: 'pending_approval', statusLabel: '待审批', statusClass: 'tag-orange', ip: '192.168.1.102', deviceFingerprint: 'WX-D7E4' }
        ],
        hasMore: false
      })
    }
  },

  async loadAuditTrail() {
    this.setData({ loading: true })
    try {
      const res = await processApi.getAuditTrail({ page: this.data.page, pageSize: 20 })
      this.setData({
        auditTrailList: res.list || [],
        hasMore: (res.list || []).length >= 20,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        auditTrailList: [
          { id: '1', recordTitle: '防风烘干记录', field: 'temperature', oldValue: '38.5', newValue: '40.2', reason: '设备校准修正', operator: '赵师傅', approver: '张主管', operateTime: '2026-05-11 15:30' },
          { id: '2', recordTitle: '黄芪切片记录', field: 'thickness', oldValue: '2-4mm', newValue: '2-3mm', reason: '按工艺规程修正', operator: '李师傅', approver: '张主管', operateTime: '2026-05-11 11:20' }
        ],
        hasMore: false
      })
    }
  },

  onRecordTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/process/e-record/e-record?id=${id}` })
  },

  async onExportAudit() {
    try {
      await processApi.exportAuditLog({})
      wx.showToast({ title: '导出成功', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'none' })
    }
  }
})
