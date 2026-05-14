const plantApi = require('../../../api/plant')
const { getLocation, isPointInPolygon, formatTime } = require('../../../utils/util')
const { FARM_OPERATION_TYPES, HERB_TYPES, FORBIDDEN_PESTICIDES } = require('../../../utils/constants')
const { uploadFile } = require('../../../utils/request')

Page({
  data: {
    isEdit: false,
    diaryId: '',
    form: {
      plotId: '',
      plotName: '',
      herbType: '',
      operationType: '',
      operationDate: '',
      operationTime: '',
      description: '',
      materialName: '',
      materialBatchNo: '',
      materialDosage: '',
      materialUnit: 'kg',
      laborCost: '',
      materialCost: '',
      photos: [],
      gpsLocation: null,
      inFence: true
    },
    operationTypes: FARM_OPERATION_TYPES,
    herbTypes: HERB_TYPES,
    materialUnits: ['kg', 'g', 'L', 'mL'],
    plotList: [],
    showPlotPicker: false,
    submitting: false,
    recognizingPesticide: false,
    pesticideWarning: '',
    currentLocation: null,
    operationTypeLabel: '',
    herbTypeLabel: ''
  },

  onLoad(options) {
    const now = new Date()
    this.setData({
      'form.operationDate': this.formatDate(now),
      'form.operationTime': this.formatTime(now)
    })

    if (options.id) {
      this.setData({ isEdit: true, diaryId: options.id })
      this.loadDiaryDetail(options.id)
    }

    this.loadPlotList()
  },

  async loadDiaryDetail(id) {
    try {
      const detail = await plantApi.getDiaryDetail(id)
      this.setData({ form: Object.assign({}, this.data.form, detail) })
    } catch (e) {}
  },

  async loadPlotList() {
    try {
      const res = await plantApi.getPlotList({ pageSize: 100 })
      this.setData({ plotList: res.list || [] })
    } catch (e) {
      this.setData({
        plotList: [
          { id: '1', name: '黄芪地块A-1', herbType: 'huangqi', boundary: [] },
          { id: '2', name: '防风地块B-2', herbType: 'fangfeng', boundary: [] },
          { id: '3', name: '柴胡地块C-1', herbType: 'chaihu', boundary: [] }
        ]
      })
    }
  },

  async getCurrentLocation() {
    wx.showModal({
      title: '定位功能未启用',
      content: '当前 AppID 尚未开通微信定位隐私接口。开通后可恢复 GPS 围栏校验。',
      showCancel: false
    })
    return
    try {
      const loc = await getLocation()
      this.setData({
        currentLocation: loc,
        'form.gpsLocation': { latitude: loc.latitude, longitude: loc.longitude }
      })
      this.checkGeoFence(loc)
    } catch (e) {}
  },

  async checkGeoFence(location) {
    if (!this.data.form.plotId) return
    try {
      const res = await plantApi.checkGeoFence({
        plotId: this.data.form.plotId,
        latitude: location.latitude,
        longitude: location.longitude
      })
      this.setData({ 'form.inFence': res.inFence })
      if (!res.inFence) {
        wx.showModal({
          title: '越界提醒',
          content: '您当前不在所选地块范围内，是否继续记录？',
          confirmText: '继续记录',
          cancelText: '重新选择'
        })
      }
    } catch (e) {}
  },

  onPlotChange(e) {
    const index = e.detail.value
    const plot = this.data.plotList[index]
    this.setData({
      'form.plotId': plot.id,
      'form.plotName': plot.name,
      'form.herbType': plot.herbType
    })
    if (this.data.currentLocation) {
      this.checkGeoFence(this.data.currentLocation)
    }
  },

  onOperationTypeChange(e) {
    const index = e.detail.value
    const type = this.data.operationTypes[index]
    this.setData({ 'form.operationType': type.value, operationTypeLabel: type.label })
  },

  onHerbTypeChange(e) {
    const index = e.detail.value
    const herb = this.data.herbTypes[index]
    this.setData({ 'form.herbType': herb.value, herbTypeLabel: herb.label })
  },

  onDateChange(e) {
    this.setData({ 'form.operationDate': e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ 'form.operationTime': e.detail.value })
  },

  onUnitChange(e) {
    const index = e.detail.value
    this.setData({ 'form.materialUnit': this.data.materialUnits[index] })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onTakePhoto() {
    wx.chooseMedia({
      count: 9 - this.data.form.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = res.tempFiles.map(f => f.tempFilePath)
        this.setData({
          'form.photos': this.data.form.photos.concat(newPhotos)
        })
      }
    })
  },

  onDeletePhoto(e) {
    const { index } = e.currentTarget.dataset
    const photos = this.data.form.photos.slice()
    photos.splice(index, 1)
    this.setData({ 'form.photos': photos })
  },

  onPreviewPhoto(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: this.data.form.photos
    })
  },

  async onScanPesticide() {
    this.setData({ recognizingPesticide: true })
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: async (res) => {
        const filePath = res.tempFiles[0].tempFilePath
        try {
          const result = await plantApi.recognizePesticide(filePath)
          if (result.name) {
            this.setData({ 'form.materialName': result.name })
            if (FORBIDDEN_PESTICIDES.includes(result.name)) {
              this.setData({ pesticideWarning: `⚠️ ${result.name} 为禁限用农药，请勿使用！` })
              wx.showModal({
                title: '禁限用农药警告',
                content: `${result.name}属于国家禁限用农药，禁止在中药材种植中使用！`,
                showCancel: false
              })
            } else {
              this.setData({ pesticideWarning: '' })
            }
          }
        } catch (e) {
          wx.showToast({ title: '识别失败，请手动输入', icon: 'none' })
        }
        this.setData({ recognizingPesticide: false })
      },
      fail: () => {
        this.setData({ recognizingPesticide: false })
      }
    })
  },

  async onSubmit() {
    const { form } = this.data
    if (!form.plotId) {
      wx.showToast({ title: '请选择地块', icon: 'none' }); return
    }
    if (!form.operationType) {
      wx.showToast({ title: '请选择操作类型', icon: 'none' }); return
    }
    if (!form.operationDate) {
      wx.showToast({ title: '请选择操作日期', icon: 'none' }); return
    }

    this.setData({ submitting: true })

    try {
      const uploadedPhotos = []
      for (const photo of form.photos) {
        if (photo.startsWith('http')) {
          uploadedPhotos.push(photo)
        } else {
          const url = await uploadFile(photo, {
            plotId: form.plotId,
            gpsLat: form.gpsLocation ? form.gpsLocation.latitude : '',
            gpsLng: form.gpsLocation ? form.gpsLocation.longitude : '',
            timestamp: Date.now()
          })
          uploadedPhotos.push(url)
        }
      }

      const submitData = Object.assign({}, form, { photos: uploadedPhotos })

      if (this.data.isEdit) {
        await plantApi.updateDiary(this.data.diaryId, submitData)
      } else {
        await plantApi.createDiary(submitData)
      }

      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
    this.setData({ submitting: false })
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
})
