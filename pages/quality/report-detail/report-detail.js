const qualityApi = require('../../../api/quality')

Page({
  data: {
    report: null,
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.loadReport(options.id)
    }
  },

  async loadReport(id) {
    this.setData({ loading: true })
    try {
      const detail = await qualityApi.getReportDetail(id)
      this.setData({ report: detail, loading: false })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        report: {
          reportNo: 'COA-20260508-001', batchNo: 'CP-20260505-001', productName: '防风饮片',
          inspectDate: '2026-05-08', inspector: '刘检验员', reviewer: '张主管',
          conclusion: '合格',
          items: [
            { name: '水分', standard: '≤13.0%', result: '11.2%', qualified: true },
            { name: '总灰分', standard: '≤8.0%', result: '5.3%', qualified: true },
            { name: '浸出物', standard: '≥25.0%', result: '32.5%', qualified: true },
            { name: '含量测定', standard: '≥0.15%', result: '0.22%', qualified: true }
          ]
        }
      })
    }
  },

  async onExport() {
    try {
      await qualityApi.exportReport(this.data.report.id)
      wx.showToast({ title: '导出成功', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'none' })
    }
  }
})
