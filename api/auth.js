const { post, get } = require('../utils/request')

module.exports = {
  login: (data) => post('/auth/login', data),
  getUserInfo: () => get('/auth/userinfo'),
  updateUserInfo: (data) => post('/auth/userinfo', data),
  logout: () => post('/auth/logout')
}
