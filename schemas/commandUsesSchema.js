const mongoose = require('mongoose')

const commandLeaderboardSchema = mongoose.Schema(
  {
    commandName: String,
    numberOfUses: Number,
  }
)

module.exports = mongoose.model('command_leaderboard', commandLeaderboardSchema)