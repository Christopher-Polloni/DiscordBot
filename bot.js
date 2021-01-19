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
const moment = require('moment')


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
        moderationLogs: {
          memberLeaveLogChannelId: null,
          memberJoinLogChannelId: null,
          memberNicknameChangeLogChannelId: null,
          banLogChannelId: null,
          messageEditLogChannelId: null,
          messageDeleteLogChannelId: null,
          messageDeleteLogIgnoreStartsWith: [],
          messageDeleteLogIgnoreIncludes: []
        },
        cleverbotSettings: {
          enabled: false,
          cleverbotChannelId: null
        },
        clashOfClansSettings: {
          clanTag: null,
          clanName: null,
          cocReminderChannelId: null,
          preparationEndWarning: null,
          preparationEndWarningMentions: null,
          warEndWarning: null,
          warEndWarningMentions: null
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
    ['moderation logs', 'Moderation Log Commands'],
    ['games', 'Game Commands'],
    ['cleverbot', 'Cleverbot Commands'],
    ['coc', 'Clash Of Clans Commands']
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
  restartClashOfClansSettings();
  restartClashOfClansReminders();
  restartModerationLogSettings();
  const dbl = new DBL(config.topggApiKey, client);
  dbl.postStats(client.guilds.cache.size)
})

client.setProvider(
  MongoClient.connect(uri).then(client => new MongoDBProvider(client, 'DiscordBot'))
).catch(console.error);

client.on('message', async (message) => {
  if (message.channel.type == 'dm') {
    return
  }
  if (!message.guild.guildSettings.cleverbotSettings.enabled) {
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
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.id === member.guild.guildSettings.welcomeSettings.welcomeChannelId);
  const joinLogChannel = member.guild.channels.cache.find(ch => ch.id === member.guild.guildSettings.moderationLogs.memberJoinLogChannelId);
  if (!welcomeChannel && !joinLogChannel) return;
  if (welcomeChannel) {
    let message = member.guild.guildSettings.welcomeSettings.welcomeMessage;
    message = message.replace(`---`, `<@${member.id}>`);
    welcomeChannel.send(message);
  }
  if (joinLogChannel) {
    const embed = new Discord.MessageEmbed()
      .setColor('GREEN')
      .setThumbnail(member.user.displayAvatarURL())
      .setTitle(`Member Joined`)
      .setDescription(`${member} ${member.user.tag}`)
      .setFooter(`ID: ${member.id}`)
      .setTimestamp()
    joinLogChannel.send(embed);
  }
});

client.on('guildMemberRemove', async (member) => {
  const channel = member.guild.channels.cache.find(ch => ch.id === member.guild.guildSettings.moderationLogs.memberLeaveLogChannelId);
  if (!channel) return;
  try {
    const banList = await member.guild.fetchBans();
    const bannedUser = banList.find(user => user.user.id == member.id);
    if (!bannedUser) {
      const embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setThumbnail(member.user.displayAvatarURL())
        .setTitle(`Member Left`)
        .setDescription(`${member} ${member.user.tag}`)
        .setFooter(`ID: ${member.id}`)
        .setTimestamp()
      return channel.send(embed);
    }
  } catch (err) {
    console.error(err);
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const nicknameLogChannel = newMember.guild.channels.cache.find(ch => ch.id === newMember.guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId);
  if (!nicknameLogChannel) return;
  if (nicknameLogChannel && (oldMember.displayName !== newMember.displayName)) {
    const embed = new Discord.MessageEmbed()
      .setColor('BLUE')
      .setThumbnail(newMember.user.displayAvatarURL())
      .setTitle(`Member Nickname Change`)
      .setDescription(`${newMember}`)
      .addField(`Old Nickname`, `${oldMember.displayName}`)
      .addField(`New Nickname`, `${newMember.displayName}`)
      .setFooter(`ID: ${newMember.id}`)
      .setTimestamp()
    nicknameLogChannel.send(embed);
  }
});

client.on('guildBanAdd', async (guild, user) => {
  const banLogChannel = guild.channels.cache.find(ch => ch.id === guild.guildSettings.moderationLogs.banLogChannelId);
  if (!banLogChannel) return;
  const banInfo = await guild.fetchBan(user);
  const embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setThumbnail(user.displayAvatarURL())
    .setTitle(`Member Banned`)
    .setDescription(`${user} ${user.tag}`)
    .setFooter(`ID: ${user.id}`)
    .setTimestamp()
  if (banInfo.reason) {
    embed.addField('Reason:', banInfo.reason)
  }
  banLogChannel.send(embed);
});

client.on('guildBanRemove', async (guild, user) => {
  const banLogChannel = guild.channels.cache.find(ch => ch.id === guild.guildSettings.moderationLogs.banLogChannelId);
  if (!banLogChannel) return;
  const embed = new Discord.MessageEmbed()
    .setColor('YELLOW')
    .setThumbnail(user.displayAvatarURL())
    .setTitle(`Member Unbanned`)
    .setDescription(`${user} ${user.tag}`)
    .setFooter(`ID: ${user.id}`)
    .setTimestamp()
  banLogChannel.send(embed);
});

client.on('guildCreate', async (guild) => {
  const dbl = new DBL(config.topggApiKey, client);
  dbl.postStats(client.guilds.cache.size)
  const channel = client.channels.cache.get('787920254969315328');
  const totalCount = client.guilds.cache.map((g) => g.memberCount).reduce((accumulator, currentValue) => accumulator + currentValue)
  const owner = await client.users.fetch(guild.ownerID)
  const embed = new Discord.MessageEmbed()
    .setColor('GREEN')
    .setThumbnail(guild.iconURL({ format: 'png' }))
    .setTitle(`Joined: ${guild.name}`)
    .addField('Members', guild.memberCount)
    .addField('Owner', owner.tag)
    .addField('Server ID', guild.id)
    .setFooter(`Total Servers: ${client.guilds.cache.size}\nTotal Members: ${totalCount}`)
    .setTimestamp()
  return channel.send(embed);
});

client.on('guildDelete', async (guild) => {
  const dbl = new DBL(config.topggApiKey, client);
  dbl.postStats(client.guilds.cache.size)
  const channel = client.channels.cache.get('787920254969315328');
  const totalCount = client.guilds.cache.map((g) => g.memberCount).reduce((accumulator, currentValue) => accumulator + currentValue)
  const owner = await client.users.fetch(guild.ownerID)
  const embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setThumbnail(guild.iconURL({ format: 'png' }))
    .setTitle(`Left: ${guild.name}`)
    .addField('Owner', owner.tag)
    .addField('Server ID', guild.id)
    .setFooter(`Total Servers: ${client.guilds.cache.size}\nTotal Members: ${totalCount}`)
    .setTimestamp()
  return channel.send(embed);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (oldMessage.partial) {
    try {
      oldMessage = await oldMessage.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      return;
    }
  }
  if (!oldMessage.guild) return;
  const messageEditLogChannel = newMessage.guild.channels.cache.find(ch => ch.id === newMessage.guild.guildSettings.moderationLogs.messageEditLogChannelId);
  if (!messageEditLogChannel) return;
  if (!oldMessage.author.bot && oldMessage.guild && (oldMessage.content !== newMessage.content)) {
    const embed = new Discord.MessageEmbed()
      .setColor('YELLOW')
      .setAuthor(oldMessage.author.tag, oldMessage.author.displayAvatarURL())
      .setTitle(`Message Edited`)
      .addField(`Author:`, `${oldMessage.author}`, true)
      .addField('Message Location:', `${newMessage.channel} [Jump to Message](${newMessage.url})`, true)
      .setFooter(`User ID: ${newMessage.author.id}`)
      .setTimestamp()
    if (oldMessage.content.length > 1024) {
      let reducedOldMessage = oldMessage.content.slice(0, 1021).concat('...')
      embed.addField(`Original:`, `${reducedOldMessage}`)
    }
    else {
      embed.addField(`Original:`, `${oldMessage.content}`)
    }
    if (newMessage.content.length > 1024) {
      let reducedNewMessage = newMessage.content.slice(0, 1021).concat('...')
      embed.addField(`After Edit:`, `${reducedNewMessage}`)
    }
    else {
      embed.addField(`After Edit:`, `${newMessage.content}`)
    }
    messageEditLogChannel.send(embed);
  }
});

client.on('messageDelete', async (message) => {
  if (!message.guild) return;
  const messageDeleteLogChannel = message.guild.channels.cache.find(ch => ch.id === message.guild.guildSettings.moderationLogs.messageDeleteLogChannelId);
  if (!messageDeleteLogChannel) return;
  if (message.partial) {
    const embed = new Discord.MessageEmbed()
      .setColor('RED')
      .setTitle(`Message Deleted`)
      .setDescription(`A message that was sent prior to <@575416249400426506> coming online has been deleted. As a result, the message content and author are unavailable.`)
      .addField('Message Location:', `${message.channel}`, true)
      .setTimestamp()
    return messageDeleteLogChannel.send(embed);
  }

  const ignoreStartsWith = message.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith
  const ignoreIncludes = message.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes

  const startsWith = (element) => message.content.startsWith(element);
  const includes = (element) => message.content.includes(element);

  if (message.isCommand || message.author.bot){
    return
  }

  if (ignoreStartsWith.length !==0 && ignoreStartsWith.some(startsWith)) {
    return
  }

  if (ignoreIncludes.length !==0 && ignoreIncludes.some(includes)){
    return
  }


  if (!message.author.bot) {
    const embed = new Discord.MessageEmbed()
      .setColor('RED')
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTitle(`Message Deleted`)
      .setDescription(`**Message Content:**\n${message.content}`)
      .addField(`Author:`, `${message.author}`, true)
      .addField('Message Location:', `${message.channel}`, true)
      .setFooter(`User ID: ${message.author.id}`)
      .setTimestamp()
    messageDeleteLogChannel.send(embed);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      return;
    }
  }
  if (config.languages[reaction.emoji.name] && (!reaction.message.channel.guild || reaction.message.channel.guild.guildSettings.reactionTranslator)) {
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
        .setColor('BLUE')
        .setTitle(`Message Translated`)
        .setDescription(`[Original Message](${reaction.message.url})`)
        .addField(`Translated to ${config.languages[reaction.emoji.name].language}:`, response.data[0].translations[0].text)
        .setFooter(`Translation Requested by ${user.username}`, user.displayAvatarURL())
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
          if (results[i].mentions !== '') {
            channel.send(`The following were mentioned above: ${results[i].mentions}`);
          }

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
          guild.guildSettings.cleverbotSettings.cleverbotChannelId = results[i].channelId;
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function restartClashOfClansSettings() {
  try {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Clash of Clans Settings")
      .find()
      .toArray()
    await client2.close();
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guild)) {
          let guild = client.guilds.cache.get(results[i].guild);
          guild.guildSettings.clashOfClansSettings.clanTag = results[i].clanTag;
          guild.guildSettings.clashOfClansSettings.clanName = results[i].clanName;
          guild.guildSettings.clashOfClansSettings.cocReminderChannelId = results[i].cocReminderChannelId;
          guild.guildSettings.clashOfClansSettings.preparationEndWarning = results[i].preparationEndWarning;
          guild.guildSettings.clashOfClansSettings.preparationEndWarningMentions = results[i].preparationEndWarningMentions;
          guild.guildSettings.clashOfClansSettings.warEndWarning = results[i].warEndWarning;
          guild.guildSettings.clashOfClansSettings.warEndWarningMentions = results[i].warEndWarningMentions;
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function restartClashOfClansReminders() {
  try {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Clash of Clans Reminders")
      .find()
      .toArray()
    await client2.close();
    for (let i = 0; i < results.length; i++) {
      const channel = client.channels.cache.get(results[i].cocReminderChannelId)
      const embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle(`Clash of Clans Reminder\n${results[i].clanName} vs ${results[i].opponent}`)
        .setThumbnail('https://cdn.freelogovectors.net/wp-content/uploads/2019/01/clash_of_clans_logo.png')
      if (results[i].type == 'preparation') {
        embed.addField('Preparation Ends in 30 Minutes', results[i].preparationEndWarning)
      }
      if (results[i].type == 'war') {
        embed.addField('War Ends in 30 Minutes', results[i].warEndWarning)
      }
      schedule.scheduleJob('cocReminder_' + results[i]._id, results[i].messageTime, async function () {
        embed.setTimestamp()
        channel.send(embed)
        if (results[i].preparationEndWarningMentions !== '' && results[i].type == 'preparation') {
          channel.send(`The following were mentioned above: ${results[i].preparationEndWarningMentions}`);
        }
        if (results[i].warEndWarningMentions !== '' && results[i].type == 'war') {
          channel.send(`The following were mentioned above: ${results[i].warEndWarningMentions}`);
        }

        const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoClient.connect();
        deletion = await mongoClient.db("DiscordBot").collection("Clash of Clans Reminders")
          .deleteOne({ "_id": ObjectId(results[i]._id) });
        await mongoClient.close();
      });
    }
  } catch (e) {
    console.error(e)
  }
}

async function restartModerationLogSettings() {
  try {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client2.connect();
    let results = await client2.db("DiscordBot").collection("Moderation Log Settings")
      .find()
      .toArray()
    await client2.close();
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guildId)) {
          let guild = client.guilds.cache.get(results[i].guildId);
          if (results[i].memberLeaveLogChannelId) {
            guild.guildSettings.moderationLogs.memberLeaveLogChannelId = results[i].memberLeaveLogChannelId;
          }
          if (results[i].memberJoinLogChannelId) {
            guild.guildSettings.moderationLogs.memberJoinLogChannelId = results[i].memberJoinLogChannelId;
          }
          if (results[i].memberNicknameChangeLogChannelId) {
            guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId = results[i].memberNicknameChangeLogChannelId;
          }
          if (results[i].banLogChannelId) {
            guild.guildSettings.moderationLogs.banLogChannelId = results[i].banLogChannelId;
          }
          if (results[i].messageEditLogChannelId) {
            guild.guildSettings.moderationLogs.messageEditLogChannelId = results[i].messageEditLogChannelId;
          }
          if (results[i].messageDeleteLogChannelId) {
            guild.guildSettings.moderationLogs.messageDeleteLogChannelId = results[i].messageDeleteLogChannelId;
          }
          if (results[i].messageDeleteLogIgnoreStartsWith) {
            guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith = results[i].messageDeleteLogIgnoreStartsWith;
          }
          if (results[i].messageDeleteLogIgnoreIncludes) {
            guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes = results[i].messageDeleteLogIgnoreIncludes;
          }
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}