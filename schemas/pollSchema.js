const mongoose = require('mongoose')

const pollSchema = mongoose.Schema(
  {
    guildId: String,
    channelId: String,
    question: String,
    pollOptions: String,
    numberOptions: Number,
    reactions: Array,
    date: Date,
    messageId: String,
    messageUrl: String
  }
)

module.exports = mongoose.model('poll', pollSchema)