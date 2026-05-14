Page({
  data: { traceInfo: null },
  onLoad(options) { this.setData({ traceInfo: JSON.parse(options.data || '{}') }) }
})