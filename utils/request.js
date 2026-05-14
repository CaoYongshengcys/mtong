const request = (options) => {
  return new Promise((resolve, reject) => {
    const app = getApp()
    if (app.globalData.demoMode && options.mock !== false) {
      reject(new Error('DEMO_MODE'))
      return
    }
    const token = wx.getStorageSync('token') || ''
    const header = Object.assign({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }, options.header || {})
    wx.request({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            handleUnauthorized()
            reject(new Error('登录已过期'))
          } else {
            wx.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(new Error(res.data.message))
          }
        } else {
          if (!options.silent) {
            wx.showToast({ title: '网络请求失败', icon: 'none' })
          }
          reject(new Error('HTTP ' + res.statusCode))
        }
      },
      fail: (err) => {
        if (!app.globalData.demoMode && options.offline !== false) {
          saveOfflineRequest(options)
        }
        if (!options.silent) {
          wx.showToast({ title: app.globalData.demoMode ? '演示模式未连接后端' : '网络连接失败，已保存离线', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}

const handleUnauthorized = () => {
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    showCancel: false,
    success: () => {
      wx.reLaunch({ url: '/pages/index/index' })
    }
  })
}

const saveOfflineRequest = (options) => {
  const queue = wx.getStorageSync('offlineQueue') || []
  queue.push({
    url: options.url,
    method: options.method || 'GET',
    data: options.data,
    timestamp: Date.now()
  })
  wx.setStorageSync('offlineQueue', queue)
}

const syncOfflineRequests = () => {
  const queue = wx.getStorageSync('offlineQueue') || []
  if (queue.length === 0) return Promise.resolve()

  const promises = queue.map(item => {
    return request(Object.assign({}, item, { offline: false }))
  })

  return Promise.allSettled(promises).then(() => {
    wx.removeStorageSync('offlineQueue')
    wx.showToast({ title: `已同步${queue.length}条离线数据`, icon: 'success' })
  })
}

const get = (url, data) => request({ url, data, method: 'GET' })
const post = (url, data) => request({ url, data, method: 'POST' })
const put = (url, data) => request({ url, data, method: 'PUT' })
const del = (url, data) => request({ url, data, method: 'DELETE' })

const uploadFile = (filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    const app = getApp()
    if (app.globalData.demoMode) {
      resolve(filePath)
      return
    }
    const token = wx.getStorageSync('token') || ''
    wx.uploadFile({
      url: app.globalData.baseUrl + '/file/upload',
      filePath,
      name: 'file',
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data.data)
        } else {
          reject(new Error(data.message))
        }
      },
      fail: reject
    })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  syncOfflineRequests
}
