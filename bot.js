const Commando = require('discord.js-commando');
const { Structures } = require('discord.js');
const path = require('path');
const config = require('./config.js');
const schedule = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const MongoDBProvider = require('commando-mongodb');
const Discord = require('discord.js');
const client3 = new Discord.Client();
const ObjectId = require('mongodb').ObjectID;
const axios = require('axios').default;
const uuidv4 = require('uuid');
const Canvas = require('canvas');
const DBL = require("dblapi.js");
const express = require('express');
const http = require('http');


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

Structures.extend('Guild', Guild => {
  class GuildSettings extends Guild {
    constructor(client, data) {
      super(client, data);
      this.guildSettings = {
        reactionTranslator: true,
        welcomeSettings: {
          welcomeChannelId: null,
          welcomeMessage: null
        },
        cleverbotSettings: {
          enabled: false,
          cleverbotChannelId: null
        }
      };
    }
  }
  return GuildSettings;
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
    ['serverreminders', 'Server Reminder Commands'],
    ['translation', 'Translation Commands'],
    ['moderation', 'Moderation Commands'],
    ['games', 'Game Commands'],
    ['cleverbot', 'Cleverbot Commands'],
  ])
  // .registerDefaults()
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
    prefix: true,
    help: true,
    eval: false,
    ping: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
  console.log("Connected as " + client.user.tag)
  client.user.setActivity(`@boop help all`)
  restartPersonalReminders();
  restartServerMessages();
  restartTranslationSettings();
  restartWelcomeSettings();
  restartCleverbotSettings();
  // const dbl = new DBL(config.topggApiKey, client);
  // dbl.postStats(client.guilds.cache.size)
})

client.setProvider(
  MongoClient.connect(uri).then(client => new MongoDBProvider(client, 'DiscordBot'))
).catch(console.error);

client.on('message', async (message) => {
  if (!message.guild.guildSettings.cleverbotSettings.enabled){
    return
  }
  let cleverbotChannel = message.guild.guildSettings.cleverbotSettings.cleverbotChannelId;
  if (!message.isCommand && !message.author.bot && cleverbotChannel == message.channel.id) {
    const url = `http://www.cleverbot.com/getreply?key=${config.cleverBotApiKey}&input=${message.content}`
    axios.get(url)
      .then(function (response) {
        return message.channel.send(response.data.output)
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});

client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.find(ch => ch.id === member.guild.guildSettings.welcomeSettings.welcomeChannelId);
  if (!channel) return;
  let message = member.guild.guildSettings.welcomeSettings.welcomeMessage;
  message = message.replace(`---`, `<@${member.id}>`);
  return channel.send(message);
});

client.on('guildCreate', (guild) => {
  console.log(`boop has joined: ${guild.name} - ${guild.id}`)
  const dbl = new DBL(config.topggApiKey, client);
  return dbl.postStats(client.guilds.cache.size)
});

client.on('guildDelete', (guild) => {
  console.log(`boop has been removed from: ${guild.name} - ${guild.id}`)
  const dbl = new DBL(config.topggApiKey, client);
  return dbl.postStats(client.guilds.cache.size)
});

client.on('messageReactionAdd', async (reaction) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      return;
    }
  }
  const flags = ['🇺🇸', '🇪🇸', '🇧🇷', '🇮🇹'];
  if (flags.includes(reaction.emoji.name) && (!reaction.message.channel.guild || reaction.message.channel.guild.guildSettings.reactionTranslator)) {
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
      const embed = new Discord.MessageEmbed()
        .setColor('#FFFF00')
        .setTitle('Message Translated')
        .addField('Original Message:', reaction.message.content)
        .addField(`Translated To ${config.languages[reaction.emoji.name].language}:`, response.data[0].translations[0].text)
        .setFooter(`${reaction.message.author.username} sent the original message`, reaction.message.author.displayAvatarURL())
      reaction.message.channel.send(embed)
    }).catch(function (error) {
      console.log(error);
    })
  }
  else {
    return
  }

});

const app = express();
const server = http.createServer(app);
const dbl = new DBL(config.topggApiKey, { webhookServer: server });

dbl.webhook.on('ready', hook => {
  console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
});
dbl.webhook.on('vote', vote => {
  const channel = client.channels.cache.get('781259759109799968');
  if (vote.isWeekend) {
    return channel.send(`<@${vote.user}> has just upvoted <@575416249400426506> 2x on top.gg!`);
  }
  else {
    return channel.send(`<@${vote.user}> has just upvoted <@575416249400426506> on top.gg!`);
  }
});

app.get('/', (req, res) => {
});

server.listen(5000, () => {
  console.log('Listening');
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
          .addField('Date', `${results[i].date.toLocaleString()} ${config.timeZone}`)
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
            .setDescription(`${results[i].date.toLocaleString()} ${config.timeZone}`)
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
          Date: ${results[i].date.toLocaleString()} ${config.timeZone}\nServer: ${results[i].guildName}\nChannel: #${results[i].channelName}\nMessage:\n${results[i].message}`)

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
            .setDescription(`${results[i].date.toLocaleString()} ${config.timeZone}`)
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

async function restartTranslationSettings() {
  try {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Translator Settings")
      .find({ reactionTranslator: false })
      .toArray()
    await client2.close();
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guild)) {
          let guild = client.guilds.cache.get(results[i].guild);
          guild.guildSettings.translatorData.reactionTranslator = false;
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function restartWelcomeSettings() {
  try {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Server Welcome Settings")
      .find()
      .toArray()
    await client2.close();
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guild)) {
          let guild = client.guilds.cache.get(results[i].guild);
          guild.guildSettings.welcomeSettings.welcomeChannelId = results[i].welcomeChannelId;
          guild.guildSettings.welcomeSettings.welcomeMessage = results[i].welcomeMessage;
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function restartCleverbotSettings() {
  try {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Cleverbot Settings")
      .find()
      .toArray()
    await client2.close();
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guild)) {
          let guild = client.guilds.cache.get(results[i].guild);
          guild.guildSettings.cleverbotSettings.enabled = true;
          guild.guildSettings.cleverbotSettings.channelId = results[i].channelId;
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}