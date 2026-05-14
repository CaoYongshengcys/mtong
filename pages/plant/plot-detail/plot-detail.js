const plantApi = require('../../../api/plant')
const { HERB_TYPES, SOIL_TYPES, GROWTH_STAGES } = require('../../../utils/constants')

Page({
  data: {
    isCreate: false,
    plotId: '',
    form: {
      name: '',
      herbType: '',
      area: '',
      soilType: '',
      location: '',
      altitude: '',
      description: '',
      boundary: []
    },
    herbTypes: HERB_TYPES,
    soilTypes: SOIL_TYPES,
    growthStages: GROWTH_STAGES,
    diaryList: [],
    soilReports: [],
    rotationRecords: [],
    submitting: false,
    latitude: 41.86,
    longitude: 114.60,
    markers: [],
    polygons: [],
    activeTab: 'info',
    herbTypeLabel: '',
    soilTypeLabel: ''
  },

  onLoad(options) {
    if (options.type === 'create') {
      this.setData({ isCreate: true })
      wx.setNavigationBarTitle({ title: '新增地块' })
    } else if (options.id) {
      this.setData({ plotId: options.id })
      this.loadPlotDetail(options.id)
    }
  },

  async loadPlotDetail(id) {
    try {
      const detail = await plantApi.getPlotDetail(id)
      const herb = HERB_TYPES.find(t => t.value === detail.herbType)
      const soil = SOIL_TYPES.find(t => t.value === detail.soilType)
      this.setData({
        form: Object.assign({}, this.data.form, detail),
        herbTypeLabel: herb ? herb.label : '',
        soilTypeLabel: soil ? soil.label : '',
        latitude: detail.latitude || 41.86,
        longitude: detail.longitude || 114.60,
        markers: detail.latitude ? [{
          id: 1, latitude: detail.latitude, longitude: detail.longitude,
          title: detail.name, iconPath: '/images/marker.png', width: 30, height: 30
        }] : [],
        polygons: detail.boundary && detail.boundary.length > 0 ? [{
          points: detail.boundary,
          strokeColor: '#2B7A4F',
          fillColor: 'rgba(43,122,79,0.15)',
          strokeWidth: 2
        }] : []
      })
    } catch (e) {
      this.loadMockDetail()
    }
  },

  loadMockDetail() {
    this.setData({
      form: {
        name: '黄芪地块A-1', herbType: 'huangqi', area: '15.5',
        soilType: 'loam', location: '康保县张纪镇', altitude: '1450',
        description: '道地黄芪种植区，2024年新开垦'
      },
      herbTypeLabel: '黄芪',
      soilTypeLabel: '壤土',
      diaryList: [
        { id: 1, operationType: 'sow', operationLabel: '播种', date: '2026-04-15', operator: '张三' },
        { id: 2, operationType: 'fertilize', operationLabel: '施肥', date: '2026-04-20', operator: '张三' },
        { id: 3, operationType: 'irrigate', operationLabel: '灌溉', date: '2026-04-25', operator: '李四' }
      ]
    })
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onHerbTypeChange(e) {
    const idx = e.detail.value
    const item = this.data.herbTypes[idx]
    this.setData({ 'form.herbType': item.value, herbTypeLabel: item.label })
  },

  onSoilTypeChange(e) {
    const idx = e.detail.value
    const item = this.data.soilTypes[idx]
    this.setData({ 'form.soilType': item.value, soilTypeLabel: item.label })
  },

  onDrawBoundary() {
    wx.navigateTo({
      url: `/pages/plant/plot-detail/plot-detail?id=${this.data.plotId}&action=draw`
    })
  },

  onMapTap(e) {
    if (!this.data.isCreate) return
    const { latitude, longitude } = e.detail
    const boundary = this.data.form.boundary.concat([{ latitude, longitude }])
    this.setData({
      'form.boundary': boundary,
      polygons: [{
        points: boundary,
        strokeColor: '#2B7A4F',
        fillColor: 'rgba(43,122,79,0.15)',
        strokeWidth: 2
      }]
    })
  },

  onClearBoundary() {
    this.setData({
      'form.boundary': [],
      polygons: []
    })
  },

  async onSubmit() {
    const { form } = this.data
    if (!form.name) { wx.showToast({ title: '请输入地块名称', icon: 'none' }); return }
    if (!form.herbType) { wx.showToast({ title: '请选择药材品种', icon: 'none' }); return }
    if (!form.area) { wx.showToast({ title: '请输入面积', icon: 'none' }); return }

    this.setData({ submitting: true })
    try {
      if (this.data.isCreate) {
        await plantApi.createPlot(form)
      } else {
        await plantApi.updatePlot(this.data.plotId, form)
      }
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
    this.setData({ submitting: false })
  }
})
