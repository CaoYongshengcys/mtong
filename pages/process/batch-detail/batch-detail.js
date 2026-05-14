const processApi = require('../../../api/process')
const { generateBatchNo } = require('../../../utils/util')
const { BATCH_PREFIX, PROCESS_STATIONS, BATCH_STATUS, HERB_TYPES } = require('../../../utils/constants')

Page({
  data: {
    isCreate: false,
    batchId: '',
    activeTab: 'info',
    form: {
      batchNo: '',
      batchType: 'primary',
      product: '',
      herbType: '',
      quantity: '',
      unit: 'kg',
      sourceBatchNo: '',
      stationRecords: []
    },
    batchTypes: [
      { value: 'primary', label: '初级批次（采收）', prefix: 'CJ' },
      { value: 'material', label: '内部物料批次', prefix: 'YL' },
      { value: 'product', label: '成品批次', prefix: 'CP' }
    ],
    processStations: PROCESS_STATIONS,
    herbTypes: HERB_TYPES,
    units: ['kg', 'g', '件'],
    traceChain: [],
    submitting: false,
    batchTypeLabel: '初级批次（采收）',
    herbTypeLabel: ''
  },

  onLoad(options) {
    if (options.type === 'create') {
      this.setData({ isCreate: true })
      wx.setNavigationBarTitle({ title: '创建批次' })
    } else if (options.id) {
      this.setData({ batchId: options.id })
      this.loadBatchDetail(options.id)
    }
  },

  async loadBatchDetail(id) {
    try {
      const detail = await processApi.getBatchDetail(id)
      this.setData({ form: Object.assign({}, this.data.form, detail) })
      this.loadTraceChain(id)
    } catch (e) {
      this.setData({
        form: {
          batchNo: 'CJ-20260510-001', batchType: 'primary', product: '防风（鲜）',
          herbType: 'fangfeng', quantity: '500', unit: 'kg', status: 'processing',
          stationRecords: [
            { station: 'wash', stationLabel: '清洗工位', operator: '王师傅', time: '2026-05-11 08:30', result: '合格', waterQuality: '达标' },
            { station: 'slice', stationLabel: '切片工位', operator: '李师傅', time: '2026-05-11 10:00', result: '合格', thickness: '2-3mm' }
          ]
        },
        traceChain: [
          { batchNo: 'CJ-20260510-001', type: 'primary', product: '防风（鲜）' }
        ]
      })
    }
  },

  async loadTraceChain(id) {
    try {
      const chain = await processApi.getBatchTrace(id)
      this.setData({ traceChain: chain })
    } catch (e) {}
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onBatchTypeChange(e) {
    const idx = e.detail.value
    const type = this.data.batchTypes[idx]
    const batchNo = generateBatchNo(type.prefix)
    this.setData({ 'form.batchType': type.value, 'form.batchNo': batchNo, batchTypeLabel: type.label })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onUnitChange(e) {
    const index = e.detail.value
    this.setData({ 'form.unit': this.data.units[index] })
  },

  onHerbTypeChange(e) {
    const idx = e.detail.value
    const item = this.data.herbTypes[idx]
    this.setData({ 'form.herbType': item.value, herbTypeLabel: item.label })
  },

  onScanStation(e) {
    const { station } = e.currentTarget.dataset
    wx.scanCode({
      success: (res) => {
        const stationItem = PROCESS_STATIONS.find(s => s.value === station)
        const userInfo = wx.getStorageSync('userInfo') || {}
        const record = {
          station: station,
          stationLabel: stationItem ? stationItem.label : station,
          operator: userInfo.nickName || '当前用户',
          time: new Date().toLocaleString(),
          code: res.result
        }
        const stationRecords = this.data.form.stationRecords.concat([record])
        this.setData({ 'form.stationRecords': stationRecords })
        wx.showToast({ title: '扫码成功', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '扫码取消', icon: 'none' })
      }
    })
  },

  async onSubmit() {
    const { form } = this.data
    if (!form.batchNo) { wx.showToast({ title: '请生成批次号', icon: 'none' }); return }
    if (!form.product) { wx.showToast({ title: '请输入产品名称', icon: 'none' }); return }
    if (!form.quantity) { wx.showToast({ title: '请输入数量', icon: 'none' }); return }

    this.setData({ submitting: true })
    try {
      if (this.data.isCreate) {
        await processApi.createBatch(form)
      } else {
        await processApi.updateBatch(this.data.batchId, form)
      }
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
    this.setData({ submitting: false })
  }
})
