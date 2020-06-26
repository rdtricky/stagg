require('dotenv').config()
module.exports = {
  env: {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
  },
}