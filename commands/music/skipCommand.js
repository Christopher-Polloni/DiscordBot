const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class skipCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Skip the song currently playing.',
      examples: ['skip'],
      guildOnly: true,
      argsType: 'multiple'
    })
  }
  run(receivedMessage, args) {
    try {
      if (!receivedMessage.guild.musicData.isPlaying) {
        return receivedMessage.say("There is no song playing right now!")
      }
      const memberVoiceChannel = receivedMessage.member.voice.channel;
      const botVoiceChannel = this.client.voice.connections.get(receivedMessage.guild.id).channel
      if (botVoiceChannel == memberVoiceChannel) {
        if (!receivedMessage.guild.musicData.isPlaying) {
          return receivedMessage.say("There is no song playing right now!")
        }
        else {
          const song = receivedMessage.guild.musicData.queue[0]
          receivedMessage.guild.musicData.songDispatcher.end();
          const videoEmbed = new Discord.MessageEmbed()
            .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
            .setTitle(`${song.title} has been skipped!`)
            .setColor('#ff1500')
            .setTimestamp()
          return receivedMessage.say(videoEmbed);
        }
      }
      else {
        return receivedMessage.say('You must be in the same voice channel as the bot to use the `skip` command.');
      }
    } catch (error) {
      return receivedMessage.say('You must be in the same voice channel as the bot to use the `skip` command.');
    }
  }
};
