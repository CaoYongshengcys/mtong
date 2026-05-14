const { get, post, put, del } = require('../utils/request')

module.exports = {
  getPlotList: (params) => get('/plant/plot/list', params),
  getPlotDetail: (id) => get(`/plant/plot/${id}`),
  createPlot: (data) => post('/plant/plot', data),
  updatePlot: (id, data) => put(`/plant/plot/${id}`, data),
  deletePlot: (id) => del(`/plant/plot/${id}`),
  getPlotBoundary: (id) => get(`/plant/plot/${id}/boundary`),
  savePlotBoundary: (id, data) => post(`/plant/plot/${id}/boundary`, data),

  getDiaryList: (params) => get('/plant/diary/list', params),
  getDiaryDetail: (id) => get(`/plant/diary/${id}`),
  createDiary: (data) => post('/plant/diary', data),
  updateDiary: (id, data) => put(`/plant/diary/${id}`, data),
  deleteDiary: (id) => del(`/plant/diary/${id}`),
  checkGeoFence: (data) => post('/plant/diary/check-fence', data),
  recognizePesticide: (filePath) => post('/plant/diary/recognize-pesticide', { filePath }),

  getArchiveList: (params) => get('/plant/archive/list', params),
  getArchiveDetail: (id) => get(`/plant/archive/${id}`),
  updateGrowthStage: (id, data) => put(`/plant/archive/${id}/stage`, data),
  predictYield: (id) => get(`/plant/archive/${id}/predict-yield`),

  getMaterialList: (params) => get('/plant/material/list', params),
  addMaterial: (data) => post('/plant/material', data),
  getMaterialUsage: (params) => get('/plant/material/usage', params)
}
