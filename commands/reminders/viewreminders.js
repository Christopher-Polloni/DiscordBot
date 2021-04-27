const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const personalRemindersSchema = require('../../schemas/personalRemindersSchema');

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'view-reminders',
      group: 'reminders',
      memberName: 'view-reminders',
      description: 'View your scheduled reminders.',
      examples: ['view-reminders'],
      guildOnly: false,
    })
  }
  async run(receivedMessage) {
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
      receivedMessage.say(`Check your DM to view your reminders.`)
    }
    receivedMessage.author.send(`Here are all of your active reminders: `)
    for (let i=0; i<results.length; i++){
      let embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setDescription(`**Reminder Number:** ${i+1}\n**Date:** ${results[i].date.toLocaleString()} ${config.timeZone}\n**Reminder:**\n${results[i].reminder}`)
       await receivedMessage.author.send(embed)
    }

        
  } catch (e) {
    console.error(`Error viewing personal reminders. User: ${receivedMessage.author.id}`, e);
    receivedMessage.say('There was an error retrieving your reminders. Please try again.')
  }

}
