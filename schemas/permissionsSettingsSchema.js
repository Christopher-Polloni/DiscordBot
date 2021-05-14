const mongoose = require('mongoose')

const permissionsSettingsSchema = mongoose.Schema(
  {
    guildId: String,
    disabledCommands: Array,
    disabledCommandGroups: Array
  }
)

module.exports = mongoose.model('permissions_setting', permissionsSettingsSchema)