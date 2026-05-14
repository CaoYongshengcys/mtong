const plantApi = require('../../../api/plant')
const { HERB_TYPES, SOIL_TYPES } = require('../../../utils/constants')

Page({
  data: {
    plotList: [],
    herbTypes: HERB_TYPES,
    soilTypes: SOIL_TYPES,
    loading: false
  },

  onLoad() {},

  onShow() {
    this.loadPlotList()
  },

  onPullDownRefresh() {
    this.loadPlotList().then(() => wx.stopPullDownRefresh())
  },

  async loadPlotList() {
    this.setData({ loading: true })
    try {
      const res = await plantApi.getPlotList({})
      const list = (res.list || []).map(item => {
        const herb = HERB_TYPES.find(t => t.value === item.herbType)
        const soil = SOIL_TYPES.find(t => t.value === item.soilType)
        return Object.assign({}, item, {
          herbLabel: herb ? herb.label : '',
          soilLabel: soil ? soil.label : ''
        })
      })
      this.setData({ plotList: list, loading: false })
    } catch (e) {
      this.setData({ loading: false })
      this.loadMockData()
    }
  },

  loadMockData() {
    this.setData({
      plotList: [
        { id: '1', name: '黄芪地块A-1', herbType: 'huangqi', herbLabel: '黄芪', area: 15.5, soilType: 'loam', soilLabel: '壤土', location: '康保县张纪镇', growthStage: 'grow', boundary: [], diaryCount: 28 },
        { id: '2', name: '防风地块B-2', herbType: 'fangfeng', herbLabel: '防风', area: 12.0, soilType: 'sandy_loam', soilLabel: '砂壤土', location: '康保县张纪镇', growthStage: 'sprout', boundary: [], diaryCount: 15 },
        { id: '3', name: '柴胡地块C-1', herbType: 'chaihu', herbLabel: '柴胡', area: 8.0, soilType: 'loam', soilLabel: '壤土', location: '康保县屯垦镇', growthStage: 'sow', boundary: [], diaryCount: 6 }
      ]
    })
  },

  onPlotTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/plant/plot-detail/plot-detail?id=${id}` })
  },

  onAddPlot() {
    wx.navigateTo({ url: '/pages/plant/plot-detail/plot-detail?type=create' })
  }
})
