const supplyApi = require('../../../api/supply')
const { REPORT_TEMPLATES } = require('../../../utils/constants')

Page({
  data: {
    reportList: [],
    templates: REPORT_TEMPLATES,
    selectedTemplate: '',
    selectedTemplateLabel: '',
    loading: false
  },

  onLoad() {},

  onShow() {
    this.loadReportList()
  },

  async loadReportList() {
    this.setData({ loading: true })
    try {
      const res = await supplyApi.getComplianceList({})
      this.setData({ reportList: res.list || [], loading: false })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        reportList: [
          { id: '1', title: '中药材生产批记录', template: 'gap_batch', batchNo: 'CJ-20260510-001', status: 'generated', statusLabel: '已生成', statusClass: 'tag-orange', createTime: '2026-05-11' },
          { id: '2', title: '中药饮片生产批记录', template: 'gmp_batch', batchNo: 'CP-20260505-002', status: 'signed', statusLabel: '已签章', statusClass: 'tag-blue', createTime: '2026-05-10' },
          { id: '3', title: '成品检验报告单', template: 'coa', batchNo: 'CP-20260505-001', status: 'submitted', statusLabel: '已上报', statusClass: 'tag-green', createTime: '2026-05-08' }
        ]
      })
    }
  },

  onTemplateChange(e) {
    const idx = e.detail.value
    const item = this.data.templates[idx]
    this.setData({ selectedTemplate: item.value, selectedTemplateLabel: item.label })
  },

  async onGenerate() {
    if (!this.data.selectedTemplate) {
      wx.showToast({ title: '请选择报告模板', icon: 'none' }); return
    }
    try {
      await supplyApi.generateCompliance({ templateType: this.data.selectedTemplate })
      wx.showToast({ title: '生成成功', icon: 'success' })
      this.loadReportList()
    } catch (e) {
      wx.showToast({ title: '生成失败', icon: 'none' })
    }
  },

  async onExport(e) {
    const { id } = e.currentTarget.dataset
    try {
      await supplyApi.exportCompliance(id)
      wx.showToast({ title: '导出成功', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'none' })
    }
  },

  async onBatchExport() {
    try {
      await supplyApi.batchExportCompliance({ ids: this.data.reportList.map(r => r.id) })
      wx.showToast({ title: '批量导出成功', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'none' })
    }
  },

  async onReportToSupervisor() {
    try {
      await supplyApi.reportToSupervisor({})
      wx.showToast({ title: '已上报监管平台', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '上报失败', icon: 'none' })
    }
  }
})
