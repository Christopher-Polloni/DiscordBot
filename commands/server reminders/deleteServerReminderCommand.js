const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const schedule = require('node-schedule');
const paginationEmbed = require('discord.js-pagination');
const serverMessagesSchema = require('../../schemas/serverMessagesSchema.js');

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'delete-server-message',
      group: 'serverreminders',
      memberName: 'delete-server-message',
      description: 'Delete one of your scheduled server messages.',
      examples: ['delete-server-message'],
      guildOnly: true,
    })
  }
  async run(receivedMessage, args) {

    if (receivedMessage.channel.name.toLowerCase() == 'scheduler') {
        return viewMessages(receivedMessage, args);
    }
    else {
        return receivedMessage.say(`This command can only be used in a channel named 'scheduler'.\nOnly those with access to this channel can use the command.\nThis is to prevent members of your server from seeing messages before they are supposed to.`)
    }
  };

}

async function viewMessages(receivedMessage) {

  try {

    let results = await serverMessagesSchema.find({ guildId: receivedMessage.guild.id }).sort({ date: 1 })

    if (results.length == 0){
      return receivedMessage.send(`There are not currently any scheduled messages set for ${receivedMessage.guild.name}.`)
    }
    
    let pages = []
    for (let i = 0; i < results.length; i++) {
      const embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle(`Upcoming Server Message - ${i+1}`)
        .setAuthor(results[i].authorName, results[i].authorAvatarUrl)
        .setDescription(`**Scheduled For:** ${results[i].date.toLocaleString()} ${config.timeZone}\n**Channel:** <#${results[i].channelId}>\n**Message:**\n${results[i].message}`)
      if (results[i].image){
        embed.setImage(results[i].image)
      } 
      else if (results[i].gif){
        embed.setImage(results[i].gif)
      }
      pages.push(embed)
    }
    
    paginationEmbed(receivedMessage, pages, ['◀️', '▶️'], 120000);

    return selectMessageToDelete(receivedMessage, results)
        
  } catch (e) {
    console.error(`Error viewing scheduled server messages. Guild: ${receivedMessage.guild.id}\n`, e);
    receivedMessage.say('There was an error retrieving your scheduled messages. Please try again.')
  }

}

async function selectMessageToDelete(receivedMessage, scheduledServerMessages) {
  receivedMessage.say(`Please enter the number of the scheduled message you'd like to remove.`).then((newmsg) => {
  const filter = m => receivedMessage.author.id === m.author.id;  
  newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
      .then(messages => {
          if (!isNaN(messages.first().content) && messages.first().content > 0 && messages.first().content <= scheduledServerMessages.length) {
              return deleteServerMessage(receivedMessage, scheduledServerMessages, messages.first().content-1)
          }
          else {
              receivedMessage.say('A valid reminder number was not provided.')
             return selectReminderToDelete(receivedMessage, scheduledServerMessages)
          }
      })
      .catch((e) => {
          console.log(e)
          return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `delete-server-message`");
      });
  });
}

async function deleteServerMessage(receivedMessage, scheduledServerMessages, arrayPosition) {
  try {
      results = await serverMessagesSchema.deleteOne({ _id: scheduledServerMessages[arrayPosition]._id });
      const embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle('Scheduled Message Deleted!')
        .setAuthor(scheduledServerMessages[arrayPosition].authorName, scheduledServerMessages[arrayPosition].authorAvatarUrl)
        .setDescription(`**Scheduled For:** ${scheduledServerMessages[arrayPosition].date.toLocaleString()} ${config.timeZone}\n**Channel:** <#${scheduledServerMessages[arrayPosition].channelId}>\n**Message:**\n${scheduledServerMessages[arrayPosition].message || ''}`)
      if (scheduledServerMessages[arrayPosition].image){
        embed.setImage(scheduledServerMessages[arrayPosition].image)
      } 
      else if (scheduledServerMessages[arrayPosition].gif){
        embed.setImage(scheduledServerMessages[arrayPosition].gif)
      }

      const thisJob = 'message_' + scheduledServerMessages[arrayPosition]._id;
      schedule.cancelJob(thisJob);
      return receivedMessage.say(embed)
  }
  catch (error) {
    console.error(`Error deleting scheduled message. User: ${receivedMessage.author.id} MongoId: ${scheduledServerMessages[arrayPosition]._id}\n`, error)
    return receivedMessage.say('Something went wrong deleting the reminders. Please try again.')
  }
  
}
