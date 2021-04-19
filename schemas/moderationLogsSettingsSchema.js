const mongoose = require('mongoose')

const moderationLogSettingsSchema = mongoose.Schema(
  {
    guildId: String,
    memberLeaveLogChannelId: String,
    memberJoinLogChannelId: String,
    memberNicknameChangeLogChannelId: String,
    banLogChannelId: String,
    messageEditLogChannelId: String,
    messageDeleteLogChannelId: String,
    messageDeleteLogIgnoreStartsWith: Array,
    messageDeleteLogIgnoreIncludes: Array


  }
)

module.exports = mongoose.model('moderation_log_setting', moderationLogSettingsSchema)
