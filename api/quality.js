const { get, post } = require('../utils/request')

module.exports = {
  getInspectTaskList: (params) => get('/quality/inspect-task/list', params),
  getInspectTaskDetail: (id) => get(`/quality/inspect-task/${id}`),
  createInspectTask: (data) => post('/quality/inspect-task', data),
  submitInspectResult: (id, data) => post(`/quality/inspect-task/${id}/result`, data),

  getReportList: (params) => get('/quality/report/list', params),
  getReportDetail: (id) => get(`/quality/report/${id}`),
  generateReport: (data) => post('/quality/report/generate', data),
  exportReport: (id) => get(`/quality/report/${id}/export`),

  getInspectItems: (type) => get('/quality/inspect-items', { type }),
  calcIndicator: (data) => post('/quality/calc-indicator', data)
}
