const mongoose = require('mongoose')

const translationSettingsSchema = mongoose.Schema(
  {
    guildId: String,
    reactionTranslator: Boolean,
    autoTranslateSettings: Array
  }
)

module.exports = mongoose.model('translation_setting', translationSettingsSchema)