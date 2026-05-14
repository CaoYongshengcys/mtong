const { get, post } = require('../utils/request')

module.exports = {
  getComplianceList: (params) => get('/supply/compliance/list', params),
  generateCompliance: (data) => post('/supply/compliance/generate', data),
  exportCompliance: (id) => get(`/supply/compliance/${id}/export`),
  batchExportCompliance: (data) => post('/supply/compliance/batch-export', data),

  getTraceInfo: (batchNo) => get('/supply/trace', { batchNo }),
  scanTraceCode: (code) => post('/supply/trace/scan', { code }),

  getVideoList: (params) => get('/supply/factory/video/list', params),
  getVideoStream: (deviceId) => get(`/supply/factory/video/stream/${deviceId}`),
  captureSnapshot: (deviceId) => post(`/supply/factory/video/snapshot/${deviceId}`),
  generateVlog: (data) => post('/supply/factory/vlog/generate', data),
  shareVlog: (id) => post(`/supply/factory/vlog/${id}/share`),

  reportToSupervisor: (data) => post('/supply/supervisor/report', data),
  getReportStatus: (params) => get('/supply/supervisor/status', params)
}
