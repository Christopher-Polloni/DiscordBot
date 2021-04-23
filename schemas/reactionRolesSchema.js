const mongoose = require('mongoose')

const reactionRolesSchema = mongoose.Schema(
  {
    guildId: String,
    messageId: String,
    emoji: Array,
    roles: Array
  }
)

module.exports = mongoose.model('reaction_role', reactionRolesSchema)