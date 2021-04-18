const mongoose = require('mongoose')

const translationSettingsSchema = mongoose.Schema(
  {
    guildId: String,
    reactionTranslator: Boolean,
  }
)

module.exports = mongoose.model('translation_setting', translationSettingsSchema)