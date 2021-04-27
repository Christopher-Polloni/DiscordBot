const mongoose = require('mongoose')

const personalRemindersSchema = mongoose.Schema(
  {
    userId: String,
    date: Date,
    reminder: String,
  }
)

module.exports = mongoose.model('personal_reminders', personalRemindersSchema)