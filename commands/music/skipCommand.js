const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class skipCommand extends Commando.Command{
  constructor(client){
    super(client, {
      name : 'skip',
      group : 'music',
      memberName : 'skip',
      description : 'Skip the current song playing',
      examples: ['skip'],
      guildOnly: true,
    })
  }
  run (receivedMessage, args) {
    console.log(args.length)
    const voiceChannel = receivedMessage.member.voice.channel;
    if (!voiceChannel) {
      return receivedMessage.reply('please join a voice channel first!');
    }
    else if (receivedMessage.guild.musicData.songDispatcher == null) {
      return receivedMessage.reply('there is no song playing right now!');
    }
    else if (args.length == 0){
      console.log('no args');
      receivedMessage.guild.musicData.songDispatcher.end();
      const song = receivedMessage.guild.musicData.queue[0]
      const videoEmbed = new Discord.MessageEmbed()
      .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
      .setTitle(`${song.title} has been skipped!`)
      .setColor('#ff1500')
      .setTimestamp()
      return receivedMessage.say(videoEmbed);
    }
    }
};
