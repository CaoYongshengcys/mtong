const qualityApi = require('../../../api/quality')
const { uploadFile } = require('../../../utils/request')
const { INSPECT_TYPES } = require('../../../utils/constants')

Page({
  data: {
    isCreate: false,
    taskId: '',
    form: {
      sampleNo: '',
      batchNo: '',
      productName: '',
      inspectType: '',
      items: [],
      conclusion: '',
      inspector: '',
      inspectDate: '',
      photos: []
    },
    inspectTypes: INSPECT_TYPES,
    standardItems: [],
    submitting: false,
    inspectTypeLabel: ''
  },

  onLoad(options) {
    if (options.type === 'create') {
      this.setData({ isCreate: true })
      wx.setNavigationBarTitle({ title: '新建检验' })
    } else if (options.taskId) {
      this.setData({ taskId: options.taskId })
      this.loadTaskDetail(options.taskId)
    }
  },

  async loadTaskDetail(id) {
    try {
      const detail = await qualityApi.getInspectTaskDetail(id)
      this.setData({ form: Object.assign({}, this.data.form, detail) })
      const inspectType = INSPECT_TYPES.find(t => t.value === detail.inspectType)
      this.setData({ inspectTypeLabel: inspectType ? inspectType.label : '' })
      this.loadInspectItems(detail.inspectType)
    } catch (e) {
      this.setData({
        form: {
          sampleNo: 'YP-20260511-001', batchNo: 'CP-20260505-002',
          productName: '柴胡饮片', inspectType: 'physical',
          items: [
            { name: '水分', standard: '≤13.0%', result: '', unit: '%', method: '烘干法' },
            { name: '总灰分', standard: '≤8.0%', result: '', unit: '%', method: '灰分测定法' },
            { name: '酸不溶性灰分', standard: '≤3.0%', result: '', unit: '%', method: '灰分测定法' },
            { name: '浸出物', standard: '≥25.0%', result: '', unit: '%', method: '热浸法' }
          ]
        }
      })
    }
  },

  async loadInspectItems(type) {
    try {
      const items = await qualityApi.getInspectItems(type)
      this.setData({ 'form.items': items })
    } catch (e) {}
  },

  onInspectTypeChange(e) {
    const idx = e.detail.value
    const item = this.data.inspectTypes[idx]
    this.setData({ 'form.inspectType': item.value, inspectTypeLabel: item.label })
    this.loadInspectItems(item.value)
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onItemResultInput(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`form.items[${index}].result`]: e.detail.value })
  },

  onTakePhoto() {
    wx.chooseMedia({
      count: 9 - this.data.form.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ 'form.photos': this.data.form.photos.concat(newPhotos) })
      }
    })
  },

  onDeletePhoto(e) {
    const { index } = e.currentTarget.dataset
    const photos = this.data.form.photos.slice()
    photos.splice(index, 1)
    this.setData({ 'form.photos': photos })
  },

  async onCalcIndicator() {
    try {
      const result = await qualityApi.calcIndicator({ items: this.data.form.items })
      this.setData({ 'form.items': result.items })
      wx.showToast({ title: '计算完成', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '计算失败', icon: 'none' })
    }
  },

  async onSubmit() {
    const { form } = this.data
    if (!form.sampleNo) { wx.showToast({ title: '请输入样品编号', icon: 'none' }); return }
    if (form.items.some(i => !i.result)) { wx.showToast({ title: '请填写所有检验结果', icon: 'none' }); return }

    this.setData({ submitting: true })
    try {
      const uploadedPhotos = []
      for (const photo of form.photos) {
        if (photo.startsWith('http')) {
          uploadedPhotos.push(photo)
        } else {
          const url = await uploadFile(photo)
          uploadedPhotos.push(url)
        }
      }

      await qualityApi.submitInspectResult(this.data.taskId, Object.assign({}, form, { photos: uploadedPhotos }))
      wx.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
    this.setData({ submitting: false })
  }
})
