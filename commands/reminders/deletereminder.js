const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const schedule = require('node-schedule');
const personalRemindersSchema = require('../../schemas/personalRemindersSchema');

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'delete-reminder',
      group: 'reminders',
      memberName: 'delete-reminder',
      description: 'Delete one of your reminders.',
      examples: ['delete-reminder'],
      guildOnly: false,
    })
  }
  async run(receivedMessage, args) {

    viewReminders(receivedMessage);

  };

}

async function viewReminders(receivedMessage) {

  try {

    let results = await personalRemindersSchema.find({ userId: receivedMessage.author.id }).sort({ date: 1 })

    if (results.length == 0){
      return receivedMessage.send(`You don't currently have any active reminders set.`)
    }
    if (receivedMessage.channel.type !== 'dm') {
      receivedMessage.say(`Check your DM to continue deleting one of your reminders.`)
    }
    receivedMessage.author.send(`Here are all of your active reminders: `)
    for (let i=0; i<results.length; i++){
      let embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setDescription(`**Reminder Number:** ${i+1}\n**Date:** ${results[i].date.toLocaleString()} ${config.timeZone}\n**Reminder:**\n${results[i].reminder}`)
       await receivedMessage.author.send(embed)
    }

    return selectReminderToDelete(receivedMessage, results)
        
  } catch (e) {
    console.error(`Error viewing personal reminders. User: ${receivedMessage.author.id}`, e);
    receivedMessage.say('There was an error retrieving your reminders. Please try again.')
  }

}

async function selectReminderToDelete(receivedMessage, reminders) {
  receivedMessage.author.send(`Please enter the number of the reminder you'd like to remove.`).then((newmsg) => {
  const filter = m => receivedMessage.author.id === m.author.id;  
  newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
      .then(messages => {
          if (!isNaN(messages.first().content) && messages.first().content > 0 && messages.first().content <= reminders.length) {
              return deleteReminder(receivedMessage, reminders, messages.first().content-1)
          }
          else {
              receivedMessage.say('A valid reminder number was not provided.')
             return selectReminderToDelete(receivedMessage)
          }
      })
      .catch((e) => {
          console.log(e)
          return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `delete-reminder`");
      });
  });
}

async function deleteReminder(receivedMessage, reminders, arrayPosition) {
  try {
      result = await personalRemindersSchema.deleteOne({ _id: reminders[arrayPosition]._id });
      const embed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Reminder Deleted!')
        .setDescription('The following reminder has been deleted!')
        .addField('Scheduled For:', `${reminders[arrayPosition].date.toLocaleString()} ${config.timeZone}`)
        .addField('Reminder:', reminders[arrayPosition].reminder)

      const thisJob = 'reminder_' + reminders[arrayPosition]._id;
      schedule.cancelJob(thisJob);
      return receivedMessage.author.send(embed)
  }
  catch (error) {
    console.error(`Error deleting personal reminder. User: ${receivedMessage.author.id} MongoId: ${reminders[arrayPosition]._id}`, error)
    return receivedMessage.say('Something went wrong deleting the reminders. Please try again.')
  }
  
}