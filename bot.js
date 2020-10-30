const Commando = require('discord.js-commando');
const { Structures } = require('discord.js');
const path = require('path');
const config = require(path.join(__dirname, 'config', 'config.json'));
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
  class GuildSettings extends Guild {
    constructor(client, data) {
      super(client, data);
      this.guildSettings = {
        reactionTranslator: true,
        welcomeSettings : {
          sendWelcome: false,
          welcomeChannelId: null,
          welcomeMessage: null
        }
      };
    }
  }
  return MusicGuild, GuildSettings;
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
    ['moderation', 'Moderation Commands']
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
})

client.setProvider(
  MongoClient.connect(uri).then(client => new MongoDBProvider(client, 'DiscordBot'))
).catch(console.error);

const applyText = (canvas, text) => {
  const ctx = canvas.getContext('2d');
  let fontSize = 70;

  do {
    ctx.font = `${fontSize -= 10}px sans-serif`;
  } while (ctx.measureText(text).width > canvas.width - 300);

  return ctx.font;
};

client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.find(ch => ch.id === 'member-log');
  if (!channel) return;

  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext('2d');

  const background = await Canvas.loadImage('./welcome-background.jpg');
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#74037b';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);

  ctx.font = applyText(canvas, `${member.displayName}!`);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${member.displayName}!`, canvas.width / 2.3, canvas.height / 1.5);

  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
  ctx.drawImage(avatar, 25, 25, 200, 200);

  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

  return channel.send(`Welcome to the server, ${member}!`, attachment);
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
  if (flags.includes(reaction.emoji.name) && (!reaction.message.channel.guild || reaction.message.channel.guild.translatorData.reactionTranslator)) {
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
          guild.translatorData.reactionTranslator = false;
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}