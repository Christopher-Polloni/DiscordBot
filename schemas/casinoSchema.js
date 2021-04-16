const mongoose = require('mongoose')

const casinoSchema = mongoose.Schema(
  {
    userId: String,
    balance: Number,
    voteCooldown: Date,
    dailyCooldown: Date
  }
)

module.exports = mongoose.model('casino', casinoSchema)