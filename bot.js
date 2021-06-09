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
const moment = require('moment');
const mongo = require('./util/mongo');
const translationSettingsSchema = require('./schemas/translationSettingsSchema');
const moderationLogsSettingsSchema = require('./schemas/moderationLogsSettingsSchema');
const commandLeaderboardSchema = require('./schemas/commandUsesSchema');
const serverWelcomeSettingsSchema = require('./schemas/serverWelcomeSettingsSchema');
const reactionRolesSchema = require('./schemas/reactionRolesSchema');
const personalRemindersSchema = require('./schemas/personalRemindersSchema');
const serverMessagesSchema = require('./schemas/serverMessagesSchema');
const pollSchema = require('./schemas/pollSchema');
const permissionsSettingsSchema = require('./schemas/permissionsSettingsSchema')

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
        translationSettings: {
          reactionTranslator: true,
          autoTranslateToggle: false,
          autoTranslateSettings: []
        },
        reactionRoles: [],
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
        permissionsSettings: {
          disabledCommands: [],
          disabledCommandGroups: [],
          enabledCommands: [],
          channelOverrides: [],
          roleOverrides: [],
          userOverrides: []
        }
      };
    }
  }
  return GuildSettings;
});

Structures.extend('User', User => {
  class Casino extends User {
    constructor(client, data) {
      super(client, data);
      this.casino = {
        setup: false,
        balance: null,
        dailyCooldown: null,
        voteCooldown: null
      };
    }
  }
  return Casino;
});

const client = new Commando.Client({
  owner: '231961695420022785',
  commandPrefix: '$',
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.registry
  // Registers your custom command groups
  .registerGroups([
    ['imagemanipulation', 'Image Manipulation Commands'],
    ['casino', 'Casino Commands'],
    ['games', 'Game Commands'],
    ['reddit', 'Reddit Image Commands'],
    ['miscellaneous', 'Miscellaneous Commands'],
    ['reminders', 'Personal Reminder Commands'],
    ['serverreminders', 'Server Message Commands'],
    ['moderation', 'Moderation Commands'],
    ['moderation logs', 'Moderation Log Commands'],
    ['server poll', 'Server Poll Commands'],
    ['reaction roles', 'Reaction Role Commands'],
    ['translation', 'Translation Commands'],
    ['permissions', 'Permissions Commands']
  ])
  // .registerDefaults()
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
    prefix: true,
    help: false,
    eval: false,
    ping: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', async () => {
  console.log("Connected as " + client.user.tag)
  client.user.setActivity(`@boop help`)
  const connection = await mongo()
  restartPersonalReminders();
  restartServerMessages();
  restartTranslationSettings();
  restartWelcomeSettings();
  restartModerationLogSettings();
  restartReactionRoles();
  restartPollResults();
  restartPermissionsSettings();
  const dbl = new DBL(config.topggApiKey, client);
  dbl.postStats(client.guilds.cache.size)
})

client.setProvider(
  MongoClient.connect(uri).then(client => new MongoDBProvider(client, 'DiscordBot'))
).catch(console.error);

client.dispatcher.addInhibitor(msg => {
  if (msg.guild){
    if (!msg.command) {
      return false
    }
    if (msg.guild.ownerID == msg.author.id) {
      return false
    }
    const permissionsSettings = msg.guild.guildSettings.permissionsSettings;
    const disabledCommand = permissionsSettings.disabledCommands.includes(msg.command.name) ? true : false
    const enabledCommand = permissionsSettings.enabledCommands.includes(msg.command.name) ? true : false
    const disabledCommandGroup = permissionsSettings.disabledCommandGroups.includes(msg.command.group.name) ? true : false
    const commandEnabledInChannel = permissionsSettings.channelOverrides.filter(channelOverride => ((channelOverride.command == msg.command.name) && (channelOverride.channelId == msg.channel.id) && (channelOverride.access == 'allow'))).length > 0 ? true : false
    const commandDisabledInChannel = permissionsSettings.channelOverrides.filter(channelOverride => ((channelOverride.command == msg.command.name) && (channelOverride.channelId == msg.channel.id) && (channelOverride.access == 'deny'))).length > 0 ? true : false
    const commandGroupEnabledInChannel = permissionsSettings.channelOverrides.filter(channelOverride => ((channelOverride.commandGroup == msg.command.group.name) && (channelOverride.channelId == msg.channel.id) && (channelOverride.access == 'allow'))).length > 0 ? true : false
    const commandGroupDisabledInChannel = permissionsSettings.channelOverrides.filter(channelOverride => ((channelOverride.commandGroup == msg.command.group.name) && (channelOverride.channelId == msg.channel.id) && (channelOverride.access == 'deny'))).length > 0 ? true : false
    
    const embed = new Discord.MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setColor('RED')

    if (commandGroupDisabledInChannel) {
      if (commandEnabledInChannel) {
        return false
      }
      else { 
        embed.setDescription(`<:x_mark:845062220467142658> The \`${msg.command.group.name}\` category is disabled in <#${msg.channel.id}>.`)
        return {reason: 'blocked', response: msg.say(embed)}
      }
    }
    else if (commandGroupEnabledInChannel) {
      if (commandDisabledInChannel) {
        embed.setDescription(`<:x_mark:845062220467142658> The \`${msg.command.name}\` command is disabled in <#${msg.channel.id}>.`)
        return {reason: 'blocked', response: msg.say(embed)}
      }
      else { 
        return false
      }
    }
    else if (commandDisabledInChannel) {
      embed.setDescription(`<:x_mark:845062220467142658> The \`${msg.command.name}\` command is disabled in <#${msg.channel.id}>.`)
      return {reason: 'blocked', response: msg.say(embed)}
    } 
    else if (commandEnabledInChannel) {
      return false
    }
    else if (!disabledCommand && !disabledCommandGroup) {
      return false
      }
    else if (disabledCommand){
      embed.setDescription(`<:x_mark:845062220467142658> The \`${msg.command.name}\` command is disabled throughout the server is not explicitly allowed in <#${msg.channel.id}>.`)
      return {reason: 'blocked', response: msg.say(embed)}
    }
    else if (disabledCommandGroup){
      if (enabledCommand) {
        return false
      }
      else {
        embed.setDescription(`<:x_mark:845062220467142658> The \`${msg.command.group.name}\` category is disabled throughout the server and is not explicitly allowed in <#${msg.channel.id}>.`)
        return {reason: 'blocked', response: msg.say(embed)}
      }
    }
  }
})
    


client.on('commandRun', async (command) => {
  
        result = await commandLeaderboardSchema.findOne({ commandName: command.name });
        if (result) {
          updatedResult = await commandLeaderboardSchema.updateOne({ commandName: command.name }, { $inc: { numberOfUses: 1 } });
        }
        else {
          updatedResult = await commandLeaderboardSchema.updateOne({ commandName: command.name }, { $set: { numberOfUses: 1 } }, { upsert: true });
        }
    
})

client.on('message', async (message) => {
  if (message.channel.type == 'dm') {
    return
  }
  if (message.guild.guildSettings.translationSettings.autoTranslateToggle && !message.isCommand && !message.author.bot) {
    const filteredSettings = message.guild.guildSettings.translationSettings.autoTranslateSettings.filter(settings => settings.translateFromChannelId == message.channel.id);
    for (let i=0; i<filteredSettings.length; i++){
      const translateToChannel = message.guild.channels.cache.get(filteredSettings[i].translateToChannelId)
      const languageCode = filteredSettings[i].languageCode
      const language = filteredSettings[i].language
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
            'to': languageCode
        },
        data: [{
            'text': message.content
        }],
        responseType: 'json'
    }).then(function (response) {
      if (response.data[0].detectedLanguage.language == languageCode && translateToChannel == message.channel.id){
        return
      }
      const embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setDescription(`[Original Message](${message.url}) in <#${message.channel.id}>\n${response.data[0].translations[0].text}`)
        .setFooter(`Auto-Translated to ${language}`, message.client.user.displayAvatarURL())
        .setTimestamp()
      translateToChannel.send(embed)
          
    }).catch(function (error) {
        console.error(`There was an error auto-translating a message. Guild: ${message.guild.id} Translate from ${filteredSettings[i].translateFromChannelId} to ${filteredSettings[i].translateToChannelId}\n`, error);
    })
    }
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
  if (guild.systemChannel) {
    const joinEmbed = new Discord.MessageEmbed()
      .setColor('BLUE')
      .setDescription(`**Hello there! Thanks for the invite, I'm <@575416249400426506>!**\n\nDefault Prefix: $
      All commands must start with the prefix of the server or <@575416249400426506>
      To see a list of all my commands, run the \`help\` command.
      Example: $help or <@575416249400426506>help\n
    **Important Links**
    [Support Server](https://discord.gg/HKUPd8Wgfk) - Get bot support if you're having issues, leave feedback or feature requests, report bugs, and be informed about new features!
    [Patreon](https://www.patreon.com/discord_bot_boop) - Help support the bot development and even get some free merchandise after your first 3 pledges to a tier!
    [Top.gg](https://Top.gg/bot/575416249400426506) - <@575416249400426506>'s page on Top.gg!
    [Top.gg Vote](https://Top.gg/bot/575416249400426506/vote) - Vote for <@575416249400426506> on Top.gg to get it trending!
    [Invite](https://discord.com/oauth2/authorize?client_id=575416249400426506&permissions=2081418495&scope=bot%20applications.commands) - Add the bot to another server!`)
    guild.systemChannel.send(joinEmbed);
  }
  const channel = client.channels.cache.get('787920254969315328');
  const totalCount = client.guilds.cache.map((g) => g.memberCount || 0).reduce((accumulator, currentValue) => accumulator + currentValue)
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
  const totalCount = client.guilds.cache.map((g) => g.memberCount || 0).reduce((accumulator, currentValue) => accumulator + currentValue)
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

  if (message.isCommand || message.author.bot) {
    return
  }

  if (ignoreStartsWith.length !== 0 && ignoreStartsWith.some(startsWith)) {
    return
  }

  if (ignoreIncludes.length !== 0 && ignoreIncludes.some(includes)) {
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
  if (user.bot) {
    return
  }
  if (config.languages[reaction.emoji.name] && (!reaction.message.channel.guild || reaction.message.channel.guild.guildSettings.translationSettings.reactionTranslator)) {
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
  else if (reaction.message.guild && reaction.message.guild.guildSettings.reactionRoles.find(m => m.messageId == reaction.message.id)) {
    const reactionRoleMessage = reaction.message.guild.guildSettings.reactionRoles.find(m => m.messageId == reaction.message.id)
    if (reactionRoleMessage.emoji.includes(reaction.emoji.id || reaction.emoji.name)) {
      if (reactionRoleMessage.emoji.indexOf(reaction.emoji.id || reaction.emoji.name) !== -1) {
        const member = await reaction.message.guild.members.fetch(user.id)
        const role = await reaction.message.guild.roles.fetch(reactionRoleMessage.roles[reactionRoleMessage.emoji.indexOf(reaction.emoji.id || reaction.emoji.name)])
        member.roles.add(role)
      }
    }
  }
  else {
    return
  }

});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      return;
    }
  }
  if (reaction.message.guild && reaction.message.guild.guildSettings.reactionRoles.find(m => m.messageId == reaction.message.id)) {
    const reactionRoleMessage = reaction.message.guild.guildSettings.reactionRoles.find(m => m.messageId == reaction.message.id)
    if (reactionRoleMessage.emoji.includes(reaction.emoji.id || reaction.emoji.name)) {
      if (reactionRoleMessage.emoji.indexOf(reaction.emoji.id || reaction.emoji.name) !== -1) {
        const member = await reaction.message.guild.members.fetch(user.id)
        const role = await reaction.message.guild.roles.fetch(reactionRoleMessage.roles[reactionRoleMessage.emoji.indexOf(reaction.emoji.id || reaction.emoji.name)])
        member.roles.remove(role)
      }
    }
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
    return channel.send(`<@${vote.user}> has just upvoted <@575416249400426506> 2x on Top.gg!`);
  }
  else {
    return channel.send(`<@${vote.user}> has just upvoted <@575416249400426506> on Top.gg!`);
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
    let results = await personalRemindersSchema.find().sort({ date: 1 })
    for (let i = 0; i < results.length; i++) {
      const reminderDate = results[i].date;
      const difference = reminderDate - new Date();
      const user = await client.users.fetch(results[i].userId);
      if (user) {
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
  
          deletion = await personalRemindersSchema.deleteOne({ "_id": ObjectId(results[i]._id) });
        }
        else {
          schedule.scheduleJob('reminder_' + results[i]._id, results[i].date, async function () {
            const embed = new Discord.MessageEmbed()
              .setColor('#4cbb17')
              .setTitle('🚨Reminder🚨')
              .setDescription(`${results[i].date.toLocaleString()} ${config.timeZone}`)
              .addField('Reminder:', results[i].reminder)
            user.send(embed)
  
            deletion = await personalRemindersSchema.deleteOne({ "_id": ObjectId(results[i]._id) });
          });
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function restartServerMessages() {
  try {
    let results = await serverMessagesSchema.find().sort({ date: 1 })
    for (let i = 0; i < results.length; i++) {
      const reminderDate = results[i].date;
      const difference = reminderDate - new Date();
      const channel = client.channels.cache.get(results[i].channelId)
      const user = await client.users.fetch(results[i].userId)
      if (difference <= 0) {
        let embed = new Discord.MessageEmbed()
          .setColor('#8B0000')
          .setTitle("Missed Message!")
          .setDescription(`Oops! It appears I was not online when I was supposed to send a message! I'm terribly sorry for this!\n\n
          Date: ${results[i].date.toLocaleString()} ${config.timeZone}\nServer: ${results[i].guildName}\nChannel: #${results[i].channelName}\nMessage:\n${results[i].message}`)

        user.send(embed);

        deletion = await serverMessagesSchema.deleteOne({ "_id": results[i]._id });
      }
      else {
        schedule.scheduleJob('message_' + results[i]._id, results[i].date, async function () {
          let embed = new Discord.MessageEmbed()
            .setColor('#4cbb17')
            .setAuthor(results[i].authorName, results[i].authorAvatarUrl)
            .setFooter(`${results[i].date.toLocaleString()} ${config.timeZone}`)
          if (results[i].message){
            embed.setDescription(results[i].message)
          }

          if (results[i].image){
            embed.setImage(results[i].image)
          } 
          else if (results[i].gif){
            embed.setImage(results[i].gif)
          }
          
          if (results[i].mentions) {
            channel.send(`${results[i].mentions}`, embed);
          }
          else {
            channel.send(embed)
          }

          deletion = await serverMessagesSchema.deleteOne({ "_id": results[i]._id });
        });
      }
    }
  } catch (e) {
    console.error(`Error server scheduled messages\n`, e);
  } 
}

async function restartTranslationSettings() {
  try {
    let results = await translationSettingsSchema.find()
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guildId)) {
          let guild = client.guilds.cache.get(results[i].guildId);
          guild.guildSettings.translationSettings.reactionTranslator = results[i].reactionTranslator || true;
          if (results[i].autoTranslateSettings && results[i].autoTranslateSettings.length > 0) {
            guild.guildSettings.translationSettings.autoTranslateToggle = true
            guild.guildSettings.translationSettings.autoTranslateSettings = results[i].autoTranslateSettings;
          }
        }
      }
    } 
  } catch (e) {
      console.error('Error restarting translation settings\n', e)
    }
}

async function restartWelcomeSettings() {
  try {
    let results = await serverWelcomeSettingsSchema.find()
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guildId)) {
          let guild = client.guilds.cache.get(results[i].guildId);
          guild.guildSettings.welcomeSettings.welcomeChannelId = results[i].welcomeChannelId;
          guild.guildSettings.welcomeSettings.welcomeMessage = results[i].welcomeMessage;
        }
      }
    }
  } catch (e) {
    console.error('Error restarting welcome settings\n', e)
  }
}

async function restartModerationLogSettings() {
  try {
    let results = await moderationLogsSettingsSchema.find()
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guildId)) {
          let guild = client.guilds.cache.get(results[i].guildId);
          results[i].memberLeaveLogChannelId ? guild.guildSettings.moderationLogs.memberLeaveLogChannelId = results[i].memberLeaveLogChannelId : guild.guildSettings.moderationLogs.memberLeaveLogChannelId = null;
          results[i].memberJoinLogChannelId ? guild.guildSettings.moderationLogs.memberJoinLogChannelId = results[i].memberJoinLogChannelId : guild.guildSettings.moderationLogs.memberJoinLogChannelId = null;
          results[i].memberNicknameChangeLogChannelId ? guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId = results[i].memberNicknameChangeLogChannelId : guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId = null;
          results[i].banLogChannelId ? guild.guildSettings.moderationLogs.banLogChannelId = results[i].banLogChannelId : guild.guildSettings.moderationLogs.banLogChannelId = null;
          results[i].messageEditLogChannelId ? guild.guildSettings.moderationLogs.messageEditLogChannelId = results[i].messageEditLogChannelId : guild.guildSettings.moderationLogs.messageEditLogChannelId = null;
          results[i].messageDeleteLogChannelId ? guild.guildSettings.moderationLogs.messageDeleteLogChannelId = results[i].messageDeleteLogChannelId : guild.guildSettings.moderationLogs.messageDeleteLogChannelId = null;
          results[i].messageDeleteLogIgnoreStartsWith ? guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith = results[i].messageDeleteLogIgnoreStartsWith : guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith = null;
          results[i].messageDeleteLogIgnoreIncludes ? guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes = results[i].messageDeleteLogIgnoreIncludes : guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes = null;
          
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function restartReactionRoles() {
  try {
    let results = await reactionRolesSchema.find()
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guildId)) {
          let guild = client.guilds.cache.get(results[i].guildId);
          guild.guildSettings.reactionRoles.push(results[i])
        }
      }
    }
  } catch (e) {
    console.error('Error restarting reaction roles\n', e)
  }
}

async function restartPollResults() {
  try {
    let results = await pollSchema.find()

    for (let i = 0; i < results.length; i++) {
      const resultDate = results[i].date;
      const difference = resultDate - new Date();
      const guild = client.guilds.cache.get(results[i].guildId)
      const channel = guild.channels.cache.find(ch => ch.id === results[i].channelId)
      const message = await channel.messages.fetch(results[i].messageId).catch((err) => console.error(`Poll message not found. MongoId: ${results[i]._id}\n`, err));
      if (!message) continue
      if (difference <= 0) {
          let votes = []
          for (let j = 0; j < results[i].numberOptions; j++) {
            votes.push(message.reactions.cache.get(results[i].reactions[j]).count - 1)
          }
          let pollResults = ''
          for (let k = 0; k < votes.length; k++) {
            pollResults = pollResults + `${results[i].reactions[k]}\t\t${votes[k]}\n`
          }
          const embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle('📊 Poll Results')
            .setDescription(`[${results[i].question}](${message.url})\n${results[i].pollOptions}\n\`\`\`Option\tNumber of Votes\n${pollResults}\`\`\``)
          channel.send(embed)
          deletion = await pollSchema.deleteOne({ "_id": results[i]._id });
      }
      else {
        schedule.scheduleJob('poll_' + results[i]._id, results[i].date, async function () {
          let votes = []
          for (let j = 0; j < results[i].numberOptions; j++) {
            votes.push(message.reactions.cache.get(results[i].reactions[j]).count - 1)
          }
          let pollResults = ''
          for (let k = 0; k < votes.length; k++) {
            pollResults = pollResults + `${results[i].reactions[k]}\t\t${votes[k]}\n`
          }
          const embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle('📊 Poll Results')
            .setDescription(`[${results[i].question}](${message.url})\n${results[i].pollOptions}\n\`\`\`Option\tNumber of Votes\n${pollResults}\`\`\``)
          channel.send(embed)
          deletion = await pollSchema.deleteOne({ "_id": results[i]._id });
        });
      }
    }
  } catch (e) {
    console.error(`Error restarting poll results\n`, e)
  }
}

async function restartPermissionsSettings() {
  try {
    let results = await permissionsSettingsSchema.find()
    let guilds = client.guilds.cache.map(guild => guild.id)
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        if (guilds.includes(results[i].guildId)) {
          let guild = client.guilds.cache.get(results[i].guildId);
          results[i].disabledCommands ? guild.guildSettings.permissionsSettings.disabledCommands = results[i].disabledCommands : guild.guildSettings.permissionsSettings.disabledCommands = [];
          results[i].disabledCommandGroups ? guild.guildSettings.permissionsSettings.disabledCommandGroups = results[i].disabledCommandGroups : guild.guildSettings.permissionsSettings.disabledCommandGroups = [];
          results[i].enabledCommands ? guild.guildSettings.permissionsSettings.enabledCommands = results[i].enabledCommands : guild.guildSettings.permissionsSettings.enabledCommands = [];
          results[i].channelOverrides ? guild.guildSettings.permissionsSettings.channelOverrides = results[i].channelOverrides : guild.guildSettings.permissionsSettings.channelOverrides = [];
        }
      }
    }
  } catch (e) {
    console.error(`Error restarting permissions settings\n`, e)
  }
}