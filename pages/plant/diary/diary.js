const plantApi = require('../../../api/plant')
const { formatDate } = require('../../../utils/util')
const { FARM_OPERATION_TYPES, HERB_TYPES } = require('../../../utils/constants')

Page({
  data: {
    diaryList: [],
    filteredTypes: [],
    operationTypes: FARM_OPERATION_TYPES,
    herbTypes: HERB_TYPES,
    currentFilter: 'all',
    currentDate: '',
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.setData({ currentDate: formatDate(new Date()) })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.refreshList()
  },

  onPullDownRefresh() {
    this.refreshList().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async refreshList() {
    this.setData({ page: 1, hasMore: true, diaryList: [] })
    return this.loadDiaryList()
  },

  async loadDiaryList() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        date: this.data.currentDate
      }
      if (this.data.currentFilter !== 'all') {
        params.operationType = this.data.currentFilter
      }
      const res = await plantApi.getDiaryList(params)
      const list = (res.list || []).map(item => {
        const operation = FARM_OPERATION_TYPES.find(t => t.value === item.operationType)
        const herb = HERB_TYPES.find(t => t.value === item.herbType)
        return Object.assign({}, item, {
          operationLabel: operation ? operation.label : item.operationType,
          herbLabel: herb ? herb.label : item.herbType,
          dateStr: formatDate(new Date(item.createTime))
        })
      })
      this.setData({
        diaryList: this.data.page === 1 ? list : this.data.diaryList.concat(list),
        hasMore: list.length >= this.data.pageSize,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
      this.loadMockData()
    }
  },

  loadMockData() {
    const mockList = [
      { id: 1, plotName: '黄芪地块A-1', herbType: 'huangqi', herbLabel: '黄芪', operationType: 'fertilize', operationLabel: '施肥', operatorName: '张三', createTime: Date.now() - 3600000, photoCount: 2, status: 'normal' },
      { id: 2, plotName: '防风地块B-2', herbType: 'fangfeng', herbLabel: '防风', operationType: 'pesticide', operationLabel: '施药', operatorName: '李四', createTime: Date.now() - 7200000, photoCount: 1, status: 'normal' },
      { id: 3, plotName: '柴胡地块C-1', herbType: 'chaihu', herbLabel: '柴胡', operationType: 'weed', operationLabel: '除草', operatorName: '王五', createTime: Date.now() - 10800000, photoCount: 3, status: 'normal' },
      { id: 4, plotName: '黄芪地块A-3', herbType: 'huangqi', herbLabel: '黄芪', operationType: 'irrigate', operationLabel: '灌溉', operatorName: '赵六', createTime: Date.now() - 14400000, photoCount: 0, status: 'alarm' }
    ]
    this.setData({ diaryList: mockList, hasMore: false })
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 })
    this.loadDiaryList()
  },

  onFilterTap(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ currentFilter: type, page: 1 })
    this.refreshList()
  },

  onDateChange(e) {
    this.setData({ currentDate: e.detail.value, page: 1 })
    this.refreshList()
  },

  onDiaryTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/plant/diary-add/diary-add?id=${id}` })
  },

  onAddTap() {
    wx.navigateTo({ url: '/pages/plant/diary-add/diary-add' })
  },

  onPlotTap() {
    wx.navigateTo({ url: '/pages/plant/plot/plot' })
  },

  onArchiveTap() {
    wx.navigateTo({ url: '/pages/plant/archive/archive' })
  }
})
