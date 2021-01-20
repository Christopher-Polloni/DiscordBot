const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const schedule = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const { indexOf } = require('ffmpeg-static');
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'schedulemessage',
      group: 'serverreminders',
      memberName: 'schedulemessage',
      description: 'Schedule a message for a channel in a server',
      examples: ['servermessage'],
      guildOnly: true,
      argsType: 'multiple'
    })
  }
  async run(receivedMessage) {

    // console.log(receivedMessage.channel.name)

    if (receivedMessage.channel.name.toLowerCase() == 'scheduler') {
      return getDate(receivedMessage);
    }
    else {
      return receivedMessage.say(`This command can only be used in a channel named 'scheduler'.\nOnly those with access to this channel can use the command.\nFuture messages may contain mentions, so limit the number of people who have access to #scheduler to avoid preemptive mass pings.`)
    }

    // const channel = receivedMessage.guild.channels.cache.find(channel => channel.id === '628064028706734090');
    // channel.send('hi');

  };

}


async function getDate(receivedMessage) {

  receivedMessage.say("Please enter the day for your reminder using the format 'MM/DD/YY'.").then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
      .then(messages => {

        const dateInput = messages.first().content.split("/");
        const yearEnd = dateInput[2];
        const yearStart = '20';
        const year = yearStart.concat(yearEnd)
        if (year !== "2020" && year !== "2021") {
          receivedMessage.say('Currently messages can only be made through the end of 2021.');
          return getDate(receivedMessage);
        }
        const month = dateInput[0] - 1;
        const day = dateInput[1];

        if (!moment([year, month, day]).isValid()) {
          receivedMessage.say('The date for this message is not valid.')
          return getDate(receivedMessage);
        }

        const date = new Date(year, month, day, 23, 59, 59);

        const difference = date - new Date();
        if (difference <= 0) {
          receivedMessage.say('The date for this message has already passed!');
          return getDate(receivedMessage);
        }

        return getTime(receivedMessage, month, day, year);
      })
      .catch((e) => {
        console.error(e);
        newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with $schedulemessage");
      });
  });

}

async function getTime(receivedMessage, month, day, year) {

  receivedMessage.say("Please enter the time for your reminder using the format 'hh:mm AM' or 'hh:mm PM'").then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
      .then(messages => {

        const completeTime = messages.first().content.split(" ");
        console.log(`completedTime = ${completeTime}`);
        const timeOfDay = completeTime[1];
        console.log(`timeOfDay = ${timeOfDay}`);
        const timeOfDayAccepted = ["am", "a.m.", "pm", "p.m."];
        const possibleHours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        const militaryHours = ["0", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
        const time = completeTime[0].split(':');
        console.log(`time = ${time}`);
        let hours = time[0];
        console.log(`hours = ${hours}`);
        let minutes = time[1];
        console.log(`minutes = ${minutes}`);

        if (timeOfDayAccepted.includes(timeOfDay.toLowerCase())) {
          if (timeOfDay.toLowerCase() == 'am' || timeOfDay.toLowerCase() == 'a.m.') {
            if (hours == '12') {
              hours = 0;
            }
            else if (hours !== '12' && possibleHours.includes(hours)) {
              hours = hours;
            }
            else if (militaryHours.includes(hours)) {
              receivedMessage.say('Military time is not supported.');
              return getTime(receivedMessage, month, day, year);
            }
            else {
              receivedMessage.say('There was an error with the time you input.');
              return getTime(receivedMessage, month, day, year);
            }

          }
          else {
            if (hours == '12') {
              hours = hours;
            }
            else if (hours !== '12' && possibleHours.includes(hours)) {
              hours = Number(hours) + 12;
            }
            else if (militaryHours.includes(hours)) {
              receivedMessage.say('Military time is not supported.');
              return getTime(receivedMessage, month, day, year);
            }
            else {
              receivedMessage.say('There was an error with the time you input.');
              return getTime(receivedMessage, month, day, year);
            }
          }
        }
        else {
          receivedMessage.say('AM/PM not recognized');
          return getTime(receivedMessage, month, day, year);
        }

        if (!moment([year, month, day, hours, minutes]).isValid()) {
          receivedMessage.say('The time for this reminder is not valid.')
          return getTime(receivedMessage, month, day, year);
        }

        const date = new Date(year, month, day, hours, minutes, 00);
        const difference = date - new Date();
        if (difference <= 0) {
          receivedMessage.say('The date and time for this reminder has already passed!');
          return getTime(receivedMessage, month, day, year);
        }
        else {
          getChannel(receivedMessage, date);

        }

      })
      .catch((e) => {
        console.log(e)
        return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with $schedulemessage");
      });
  });

}

async function getChannel(receivedMessage, date) {

  receivedMessage.say(`Please enter the channel for your message to be sent in using the format <#${receivedMessage.channel.id}>.`).then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 600000, max: 1, errors: ['time'] })
      .then(messages => {

        if (messages.first().mentions.channels.first()) {
          const channelID = messages.first().mentions.channels.first().id;
          const channelName = messages.first().mentions.channels.first().name;

          return getMessage(receivedMessage, date, channelID, channelName)
        }
        else {
          receivedMessage.say("You didn't properly mention a channel.")
          return getChannel(receivedMessage)
        }


      })
      .catch((e) => {
        console.log(e)
        return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with $schedulemessage");
      });
  });

}

async function getMessage(receivedMessage, date, channelID, channelName) {

  console.log(date);
  receivedMessage.say("Please enter message for your reminder.").then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 600000, max: 1, errors: ['time'] })
      .then(messages => {

        let userMentions = messages.first().mentions.users
        let userMentionsArray = userMentions.array()
        let roleMentions = messages.first().mentions.roles
        let roleMentionsArray = roleMentions.array()
        let mentions = '';
        for (let i = 0; i < userMentionsArray.length; i++) {
          mentions = mentions.concat(` <@${userMentionsArray[i].id}>`)
        }
        for (let i = 0; i < roleMentionsArray.length; i++) {
          mentions = mentions.concat(` <@&${roleMentionsArray[i].id}>`)
        }

        const messageArgs = messages.first().content.split(" ");
        const regex = /((http:\/\/(giphy\.com\/gifs\/.*|gph\.is\/.*|media\.giphy\.com\/media\/.*|tenor\.co\/.*|tenor\.com\/.*))|(https:\/\/(giphy\.com\/gifs\/.*|gph\.is\/.*|media\.giphy\.com\/media\/.*|tenor\.co\/.*|tenor\.com\/.*)))/i
        let index = null
        let gif = null
        messageArgs.forEach(element => {
          if (regex.test(element)){
            index = messageArgs.indexOf(element)
          }
        });
        if (index){
          gif = messageArgs[index]
        }
        else {
          gif = null
        }
        messageArgs.splice(index, 1)
        const message = messageArgs.join(" ")

        return createnewMessage(
          {
            authorId: receivedMessage.author.id,
            authorName: receivedMessage.author.username,
            authorAvatarUrl: receivedMessage.author.displayAvatarURL(),
            date: date,
            channelID: channelID,
            channelName: channelName,
            guildID: receivedMessage.guild.id,
            guildName: receivedMessage.guild.name,
            message: message,
            gif: gif,
            mentions: mentions,
            command: 'schedulemessage'
          },
          receivedMessage
        )

      })
      .catch((e) => {
        console.log(e)
        return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with $schedulemessage");
      });
  });

}


async function createnewMessage(newMessage, receivedMessage) {

  try {

    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    // Connect to the MongoDB cluster
    await client2.connect();

    let result = await client2.db("DiscordBot").collection("Server Messages").insertOne(newMessage);
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedId);
    const embed = new Discord.MessageEmbed()
      .setColor('#FFFF00')
      .setTitle('Message Set!')
      .addField('Scheduled For:', `${newMessage.date.toLocaleString()} ${config.timeZone}`)
      .addField('Channel:', `<#${newMessage.channelID}>`)
      .setFooter(`To delete this scheduled message: $deleteservermessage ${result.insertedId}`)
      if (newMessage.message !== ''){
        embed.addField('Message:', newMessage.message)
      }
      else {
        embed.addField('Message:', '\u200B')
      }
      if (newMessage.gif){
        embed.setImage(newMessage.gif)
      }
    receivedMessage.say(embed)
    receivedMessage.react('✅');

    console.log('message_' + result.insertedId);

    const embed2 = new Discord.MessageEmbed()
      .setColor('#4cbb17')
      .setTitle(`Scheduled Message`)
      .setAuthor(newMessage.authorName, newMessage.authorAvatarUrl)
      .setDescription(`${newMessage.date.toLocaleString()} ${config.timeZone}`)
      if (newMessage.message !== ''){
        embed2.addField('Message:', newMessage.message)
      }
      else {
        embed2.addField('Message:', '\u200B')
      }
      if (newMessage.gif){
        embed2.setImage(newMessage.gif)
      }
    const channel = receivedMessage.guild.channels.cache.find(channel => channel.id === `${newMessage.channelID}`);
    
    const difference = newMessage.date - new Date();

    if (difference <= 0) {
      try {
        channel.send(embed2);
        if (newMessage.mentions !== '') {
          channel.send(`The following were mentioned above: ${newMessage.mentions}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        deletion = await client2.db("DiscordBot").collection("Server Messages")
          .deleteOne({ _id: result.insertedId });
      }
    }
    else {
      schedule.scheduleJob('message_' + result.insertedId, newMessage.date, async function () {
        try {
          channel.send(embed2);
          if (newMessage.mentions !== '') {
            channel.send(`The following were mentioned above: ${newMessage.mentions}`);
          }
        } catch (e) {
          console.error(e);
        } finally {
          deletion = await client2.db("DiscordBot").collection("Server Messages")
            .deleteOne({ _id: result.insertedId });
        }
      });
    }
  } catch (e) {
    console.error(e);
    receivedMessage.reply('There was an error uploading your message. Please try again')
  } finally {
    await client2.close();
  }

}
