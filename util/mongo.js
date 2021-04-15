const config = require('../config.js');
const mongoose = require('mongoose')

module.exports = async () => {
  await mongoose.connect(config.mongoUri, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  return mongoose
}