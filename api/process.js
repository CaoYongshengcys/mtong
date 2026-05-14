const { get, post, put, del } = require('../utils/request')

module.exports = {
  getBatchList: (params) => get('/process/batch/list', params),
  getBatchDetail: (id) => get(`/process/batch/${id}`),
  createBatch: (data) => post('/process/batch', data),
  updateBatch: (id, data) => put(`/process/batch/${id}`, data),
  getBatchTrace: (id) => get(`/process/batch/${id}/trace`),
  linkBatch: (data) => post('/process/batch/link', data),
  scanWorkstation: (data) => post('/process/batch/scan', data),

  getIotDevices: (params) => get('/process/iot/devices', params),
  getIotData: (deviceId, params) => get(`/process/iot/device/${deviceId}/data`, params),
  getIotAlarmList: (params) => get('/process/iot/alarm/list', params),
  setIotThreshold: (deviceId, data) => post(`/process/iot/device/${deviceId}/threshold`, data),

  getERecordList: (params) => get('/process/e-record/list', params),
  getERecordDetail: (id) => get(`/process/e-record/${id}`),
  createERecord: (data) => post('/process/e-record', data),
  approveERecord: (id, data) => post(`/process/e-record/${id}/approve`, data),
  getAuditTrail: (params) => get('/process/e-record/audit-trail', params),
  exportAuditLog: (params) => get('/process/e-record/audit-trail/export', params)
}
