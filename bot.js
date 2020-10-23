const Commando = require('discord.js-commando');
const { Structures } = require('discord.js');
const path = require('path');
const config = require(path.join(__dirname, 'config', 'config.json'));
const schedule = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const Discord = require('discord.js');
const client3 = new Discord.Client();
const ObjectId = require('mongodb').ObjectID;
const axios = require('axios').default;
const uuidv4 = require('uuid');

Structures.extend('Guild', Guild => {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        volume: 1,
        songDispatcher: null
      };
    }
  }
  return MusicGuild;
});

const client = new Commando.Client({
  owner: '231961695420022785',
  commandPrefix: '$',
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.registry
  // Registers your custom command groups
  .registerGroups([
    ['miscellaneous', 'Miscellaneous Commands'],
    ['music', 'Music Commands'],
    ['reddit', 'Reddit Image Commands'],
    ['reminders', 'Personal Reminder Commands'],
    ['serverreminders', 'Server Reminder Commands']
  ])
  // .registerDefaults()
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
    prefix: false,
    help: true,
    eval: false,
    ping: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
  console.log("Connected as " + client.user.tag)
  client.user.setActivity(`${client.commandPrefix}` + "help all")
  restartPersonalReminders();
  restartServerMessages();
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      return;
    }
  }
  const flags = ['🇺🇸', '🇪🇸', '🇧🇷', '🇮🇹'];
  if (flags.includes(reaction.emoji.name)) {
    axios({
      baseURL: config.translationEndpoint,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': config.translationSubscriptionKey,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4.v4().toString(),
        'Ocp-Apim-Subscription-Region': 'eastus'
      },
      params: {
        'api-version': '3.0',
        'to': config.languages[reaction.emoji.name].abbreviation
      },
      data: [{
        'text': reaction.message.content
      }],
      responseType: 'json'
    }).then(function (response) {
      console.log(reaction.message.author.username)
      console.log(reaction)
      const embed = new Discord.MessageEmbed()
        .setColor('#FFFF00')
        .setTitle('Message Translated')
        .addField('Original Message:', reaction.message.content)
        .addField(`Translated To ${config.languages[reaction.emoji.name].language}:`, response.data[0].translations[0].text)
        .setFooter(`${reaction.message.author.username} sent the original message`, reaction.message.author.displayAvatarURL())
      reaction.message.channel.send(embed)
      // console.log(JSON.stringify(response.data[0].translations[0].text, null, 4));
    }).catch(function (error) {
      console.log(error);
    })
  }
  else {
    return
  }

});


client.login(config.token);

async function restartPersonalReminders() {
  try {
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Personal Reminders")
      .find({ command: 'remindme' })
      .sort({ date: 1 })
      .toArray()
    for (let i = 0; i < results.length; i++) {
      const reminderDate = results[i].date;
      const difference = reminderDate - new Date();
      const user = client.users.cache.get(results[i].authorId);
      if (difference <= 0) {
        console.log(results[i]);
        console.log('The above has passed')
        const embed = new Discord.MessageEmbed()
          .setColor('#8B0000')
          .setTitle("Missed Reminder!")
          .setDescription("Oops! It appears I was not online when I was supposed to remind you of something! I'm terribly sorry for this!")
          .addField('Date', `${results[i].date.toLocaleString()} EDT`)
          .addField('Reminder', results[i].reminder)

        user.send(embed);

        deletion = await client2.db("DiscordBot").collection("Personal Reminders")
          .deleteOne({ "_id": ObjectId(results[i]._id) });
      }
      else {
        schedule.scheduleJob('reminder_' + results[i]._id, results[i].date, async function () {
          const embed = new Discord.MessageEmbed()
            .setColor('#4cbb17')
            .setTitle('🚨Reminder🚨')
            .setDescription(`${results[i].date.toLocaleString()} EDT`)
            .addField('Reminder:', results[i].reminder)
          user.send(embed)

          const MongoClient = require('mongodb').MongoClient;
          const uri = config.mongoUri;
          const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
          await client2.connect();
          deletion = await client2.db("DiscordBot").collection("Personal Reminders")
            .deleteOne({ "_id": ObjectId(results[i]._id) });
          await client2.close();
        });
      }

    }

  } catch (e) {
    console.error(e);
  } finally {
    await client2.close();
  }
}

async function restartServerMessages() {
  try {
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Server Messages")
      .find({ command: 'schedulemessage' })
      .sort({ date: 1 })
      .toArray()
    for (let i = 0; i < results.length; i++) {
      const reminderDate = results[i].date;
      const difference = reminderDate - new Date();
      const channel = client.channels.cache.get(results[i].channelID)
      const user = client.users.cache.get(results[i].authorId)
      if (difference <= 0) {
        const embed = new Discord.MessageEmbed()
          .setColor('#8B0000')
          .setTitle("Missed Message!")
          .setDescription(`Oops! It appears I was not online when I was supposed to send a message! I'm terribly sorry for this!\n\n
          Date: ${results[i].date.toLocaleString()} EDT\nServer: ${results[i].guildName}\nChannel: #${results[i].channelName}\nMessage:\n${results[i].message}`)

        user.send(embed);

        deletion = await client2.db("DiscordBot").collection("Server Messages")
          .deleteOne({ "_id": ObjectId(results[i]._id) });
      }
      else {
        schedule.scheduleJob('message_' + results[i]._id, results[i].date, async function () {
          const embed = new Discord.MessageEmbed()
            .setColor('#4cbb17')
            .setTitle(`Scheduled Message`)
            .setAuthor(results[i].authorName, results[i].authorAvatarUrl)
            .setDescription(`${results[i].date.toLocaleString()} EDT`)
            .addField('Message:', results[i].message)
          channel.send(embed)

          const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
          await mongoClient.connect();
          deletion = await mongoClient.db("DiscordBot").collection("Server Messages")
            .deleteOne({ "_id": ObjectId(results[i]._id) });
          await mongoClient.close();
        });
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client2.close();
  }
}