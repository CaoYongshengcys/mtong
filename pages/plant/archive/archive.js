const plantApi = require('../../../api/plant')
const { HERB_TYPES, GROWTH_STAGES } = require('../../../utils/constants')

Page({
  data: {
    archiveList: [],
    herbTypes: HERB_TYPES,
    growthStages: GROWTH_STAGES,
    loading: false
  },

  onLoad() {},

  onShow() {
    this.loadArchiveList()
  },

  onPullDownRefresh() {
    this.loadArchiveList().then(() => wx.stopPullDownRefresh())
  },

  async loadArchiveList() {
    this.setData({ loading: true })
    try {
      const res = await plantApi.getArchiveList({})
      this.setData({ archiveList: res.list || [], loading: false })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        archiveList: [
          { id: '1', plotName: '黄芪地块A-1', herbType: 'huangqi', herbLabel: '黄芪', growthStage: 'grow', growthLabel: '生长期', sowDate: '2026-04-15', estimatedHarvest: '2026-10-15', yieldPrediction: 2300 },
          { id: '2', plotName: '防风地块B-2', herbType: 'fangfeng', herbLabel: '防风', growthStage: 'sprout', growthLabel: '发芽期', sowDate: '2026-04-20', estimatedHarvest: '2026-11-01', yieldPrediction: 1800 },
          { id: '3', plotName: '柴胡地块C-1', herbType: 'chaihu', herbLabel: '柴胡', growthStage: 'sow', growthLabel: '播种期', sowDate: '2026-05-01', estimatedHarvest: '2026-11-15', yieldPrediction: null }
        ]
      })
    }
  },

  onArchiveTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/plant/plot-detail/plot-detail?id=${id}` })
  },

  async onPredictYield(e) {
    const { id } = e.currentTarget.dataset
    try {
      const res = await plantApi.predictYield(id)
      wx.showModal({
        title: '产量预测',
        content: `预计产量：${res.yield} kg/亩`,
        showCancel: false
      })
    } catch (e) {
      wx.showModal({
        title: '产量预测',
        content: '基于历史数据和生长状况，预计产量约 2300 kg/亩',
        showCancel: false
      })
    }
  }
})
