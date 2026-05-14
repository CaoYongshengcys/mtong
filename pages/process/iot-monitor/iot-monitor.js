const processApi = require('../../../api/process')

Page({
  data: {
    devices: [],
    alarmList: [],
    selectedDevice: null,
    tempHistory: [],
    humidityHistory: [],
    loading: false,
    chartData: null
  },

  onLoad() {},

  onShow() {
    this.loadDevices()
    this.loadAlarms()
  },

  onPullDownRefresh() {
    Promise.all([this.loadDevices(), this.loadAlarms()]).then(() => wx.stopPullDownRefresh())
  },

  async loadDevices() {
    this.setData({ loading: true })
    try {
      const res = await processApi.getIotDevices({})
      this.setData({ devices: res.list || [], loading: false })
    } catch (e) {
      this.setData({ loading: false })
      this.setData({
        devices: [
          { id: '1', name: '烘干房1号温湿度', type: 'temp_humidity', online: true, statusLabel: '在线', statusClass: 'tag-green', dotClass: 'status-dot-online', tempClass: '', batteryClass: '', battery: 85, lastData: { temperature: 38.5, humidity: 45.2, time: '2026-05-11 14:30' }, alarm: false },
          { id: '2', name: '烘干房2号温湿度', type: 'temp_humidity', online: true, statusLabel: '告警', statusClass: 'tag-red', dotClass: 'status-dot-alarm', tempClass: 'text-danger', batteryClass: '', battery: 72, lastData: { temperature: 42.1, humidity: 38.6, time: '2026-05-11 14:28' }, alarm: true },
          { id: '3', name: '仓库1号温湿度', type: 'temp_humidity', online: false, statusLabel: '离线', statusClass: 'tag-orange', dotClass: 'status-dot-offline', tempClass: '', batteryClass: 'text-danger', battery: 15, lastData: { temperature: 25.3, humidity: 55.1, time: '2026-05-11 12:00' }, alarm: false },
          { id: '4', name: '清洗间温湿度', type: 'temp_humidity', online: true, statusLabel: '在线', statusClass: 'tag-green', dotClass: 'status-dot-online', tempClass: '', batteryClass: '', battery: 90, lastData: { temperature: 22.8, humidity: 62.3, time: '2026-05-11 14:25' }, alarm: false }
        ]
      })
    }
  },

  async loadAlarms() {
    try {
      const res = await processApi.getIotAlarmList({ limit: 10 })
      this.setData({ alarmList: res.list || [] })
    } catch (e) {
      this.setData({
        alarmList: [
          { id: '1', deviceName: '烘干房2号', message: '温度超标 42.1°C（阈值40°C）', time: '2026-05-11 14:28', level: 'danger', handled: false },
          { id: '2', deviceName: '仓库1号', message: '设备离线', time: '2026-05-11 12:00', level: 'warning', handled: false }
        ]
      })
    }
  },

  async onDeviceTap(e) {
    const { id } = e.currentTarget.dataset
    const device = this.data.devices.find(d => d.id === id)
    this.setData({ selectedDevice: device })
    try {
      const res = await processApi.getIotData(id, { hours: 24 })
      this.setData({ tempHistory: res.temperature || [], humidityHistory: res.humidity || [] })
    } catch (e) {}
  },

  onCloseDetail() {
    this.setData({ selectedDevice: null })
  },

  onSetThreshold() {
    wx.showModal({
      title: '设置阈值',
      content: '请联系管理员在后台设置设备告警阈值',
      showCancel: false
    })
  }
})
