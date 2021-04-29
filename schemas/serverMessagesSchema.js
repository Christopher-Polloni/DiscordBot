const mongoose = require('mongoose')

const serverMessagesSchema = mongoose.Schema(
  {
    userId: String,
    authorName: String,
    authorAvatarUrl: String,
    date: Date,
    channelId: String,
    channelName: String,
    guildId: String,
    guildName: String,
    message: String,
    image: String,
    gif: String,
    mentions: String
  }
)

module.exports = mongoose.model('server_messages', serverMessagesSchema)