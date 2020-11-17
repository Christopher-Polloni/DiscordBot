const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class queueCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'music',
      memberName: 'queue',
      description: 'View list of songs in the queue.',
      examples: ['queue'],
      guildOnly: true,
      argsType: 'multiple'
    })
  }
  run(receivedMessage, args) {
    try {
      if (!receivedMessage.guild.musicData.isPlaying && receivedMessage.guild.musicData.queue.length == 0) {
        return receivedMessage.say("There is no song playing right now and the queue is empty!")
      }
      const memberVoiceChannel = receivedMessage.member.voice.channel;
      const botVoiceChannel = this.client.voice.connections.get(receivedMessage.guild.id).channel
      if (botVoiceChannel == memberVoiceChannel) {
        if (!receivedMessage.guild.musicData.isPlaying && receivedMessage.guild.musicData.queue.length == 0) {
          return receivedMessage.say("There is no song playing right now and the queue is empty!")
        }
        else {
          const queue = receivedMessage.guild.musicData.queue
          const embed = new Discord.MessageEmbed()
            .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
            .setTitle(`Queue for ${receivedMessage.guild.name}`)
            .setColor('#ff1500')
            .setTimestamp()
          for (let i = 0; i < 11; i++) {
            if (i < queue.length) {
              if (i == 0) {
                embed.addField(`**Now Playing:**`, `[${queue[0].title}](${queue[0].videoLink}) \n${getSongDuration(queue[0].songLength)} | ${queue[0].author}`)
                if (queue.length >= 2) {
                  embed.addField(`\u200b`, `**Up Next:**`)
                }
              }
              else {
                embed.addField(`${i}.`, `[${queue[i].title}](${queue[i].videoLink}) \n${getSongDuration(queue[i].songLength)} | ${queue[i].author}`)
              }
              embed.setFooter(`Showing ${i}/${queue.length - 1} Songs Up Next\nTotal Duration of Songs: ${getTotalDuration(receivedMessage)}`)
            }
            else {
              break
            }
          }
          return receivedMessage.say(embed);
        }
      }
      else {
        return receivedMessage.say('You must be in the same voice channel as the bot to use the `queue` command.');
      }
    } catch (error) {
      return receivedMessage.say('You must be in the same voice channel as the bot to use the `queue` command.');
    }
  }
};

function getSongDuration(songLength) {
  let seconds = Number(songLength);

  let date = new Date(seconds * 1000);
  let hh = date.getUTCHours();
  let mm = date.getUTCMinutes();
  let ss = date.getSeconds();

  if (seconds > 86399) {
    let t = "Duration is longer than 24 hours"
    return t;
  }
  else if (hh == "00") {
    if (ss < 10) {
      ss = "0" + ss;
    }
    let t = `${mm}:${ss}`;
    return t;
  }
  else {
    if (mm < 10) {
      mm = "0" + mm;
    }
    if (ss < 10) {
      ss = "0" + ss;
    }
    let t = `${hh}:${mm}:${ss}`
    return t;
  }
}

function getTotalDuration(receivedMessage) {
  let seconds = 0;
  for (let i = 0; i < receivedMessage.guild.musicData.queue.length; i++) {
    seconds = seconds + Number(receivedMessage.guild.musicData.queue[i].songLength);
  }

  let date = new Date(seconds * 1000);
  let hh = date.getUTCHours();
  let mm = date.getUTCMinutes();
  let ss = date.getSeconds();

  if (seconds > 86399) {
    let t = "Duration is longer than 24 hours";
    return t;
  }
  else if (hh == "00") {
    if (ss < 10) {
      ss = "0" + ss;
    }
    let t = `${mm}:${ss}`;
    return t;
  }
  else {
    if (mm < 10) {
      mm = "0" + mm;
    }
    if (ss < 10) {
      ss = "0" + ss;
    }
    let t = `${hh}:${mm}:${ss}`
    return t;
  }
}