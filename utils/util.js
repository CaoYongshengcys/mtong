const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const generateBatchNo = (prefix) => {
  const now = new Date()
  const dateStr = formatDate(now).replace(/-/g, '')
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
  return `${prefix}-${dateStr}-${random}`
}

const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: (err) => {
        if (err.errMsg.indexOf('auth deny') !== -1 || err.errMsg.indexOf('authorize') !== -1) {
          wx.showModal({
            title: '定位权限',
            content: '需要获取您的位置信息用于农事记录，请授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
        reject(err)
      }
    })
  })
}

const isPointInPolygon = (point, polygon) => {
  const { latitude, longitude } = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude, yi = polygon[i].longitude
    const xj = polygon[j].latitude, yj = polygon[j].longitude
    const intersect = ((yi > longitude) !== (yj > longitude))
      && (latitude < (xj - xi) * (longitude - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

const addWatermark = (ctx, options) => {
  const { text, time, operator, canvasWidth, canvasHeight } = options
  ctx.setFontSize(20)
  ctx.setFillStyle('rgba(255,255,255,0.7)')
  const lines = [
    text || '',
    time || formatTime(new Date()),
    operator || ''
  ]
  lines.forEach((line, index) => {
    if (line) {
      ctx.fillText(line, 10, canvasHeight - 60 + index * 24)
    }
  })
}

const debounce = (fn, delay = 500) => {
  let timer = null
  return function () {
    const args = arguments
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const throttle = (fn, delay = 1000) => {
  let lastTime = 0
  return function () {
    const args = arguments
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

const validatePhone = (phone) => /^1[3-9]\d{9}$/.test(phone)
const validateIdCard = (idCard) => /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)

const getDictLabel = (dictList, value) => {
  const item = dictList.find(d => d.value === value)
  return item ? item.label : value
}

const calcCultivationCost = (records) => {
  return records.reduce((total, r) => {
    return total + (r.materialCost || 0) + (r.laborCost || 0) + (r.equipmentCost || 0)
  }, 0)
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  generateBatchNo,
  getLocation,
  isPointInPolygon,
  addWatermark,
  debounce,
  throttle,
  validatePhone,
  validateIdCard,
  getDictLabel,
  calcCultivationCost
}
