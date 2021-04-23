const mongoose = require('mongoose')

const serverWelcomeSettingsSchema = mongoose.Schema(
  {
    guildId: String,
    welcomeChannelId: String,
    welcomeMessage: String
  }
)

module.exports = mongoose.model('server_welcome_setting', serverWelcomeSettingsSchema)