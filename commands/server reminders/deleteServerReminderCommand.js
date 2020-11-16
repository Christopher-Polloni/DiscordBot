const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const schedule = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require('mongodb').ObjectID;

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'deleteservermessage',
      group: 'serverreminders',
      memberName: 'deleteservermessage',
      description: 'Delete one of your scheduled server messages.',
      examples: ['deleteservermessage <messageID>'],
      guildOnly: true,
    })
  }
  async run(receivedMessage, args) {

    if (receivedMessage.channel.name.toLowerCase() == 'scheduler') {
        return deleteServerMessage(receivedMessage, args);
    }
    else {
        return receivedMessage.say(`This command can only be used in a channel named 'scheduler'.\nOnly those with access to this channel can use the command.\nThis is to prevent members of your server from seeing messages before they are supposed to.`)
    }
  };

}


async function deleteServerMessage(receivedMessage, id) {

  try {
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
    await client2.connect();

    let results = await client2.db("DiscordBot").collection("Server Messages")
      .find({"_id": ObjectId(id)})
      .toArray()
    console.log('Results');
    console.log(results);
    if (results.length == 0) {
      receivedMessage.say(`This reminder does not exist.`)
    }
    else {

      deletion = await client2.db("DiscordBot").collection("Server Messages")
        .deleteOne({"_id": ObjectId(id)});

      const embed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Scheduled Message Deleted!')
        .setDescription(`The following reminder has been deleted!\n\nDate: ${results[0].date.toLocaleString()} ${config.timeZone}\nChannel: <#${results[0].channelID}>\nMessage:\n${results[0].message}`)
      receivedMessage.say(embed)

      const thisJob = 'message_' + id;
      schedule.cancelJob(thisJob);
    
    }
  } catch (e) {
    console.error(e);
    receivedMessage.say('There was an error deleting your reminder. Please try again')
  } finally {
    await client2.close();
  }

}
