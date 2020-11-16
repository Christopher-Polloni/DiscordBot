const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class disconnectCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'disconnect',
      group: 'music',
      memberName: 'disconnect',
      description: 'Disconnect the bot from playing music.',
      examples: ['disconnect'],
      guildOnly: true,
      argsType: 'single'
    })
  }
  async run(receivedMessage, args) {
    const memberVoiceChannel = receivedMessage.member.voice.channel;
    const botVoiceChannel = this.client.voice.connections.get(receivedMessage.guild.id).channel

    if (memberVoiceChannel !== botVoiceChannel) {
      return receivedMessage.say('You must be in the same voice channel as the bot to use the `disconnect` command.');
    }

    receivedMessage.guild.musicData.queue = [];
    receivedMessage.guild.musicData.isPlaying = false;
    receivedMessage.guild.musicData.songDispatcher = null
    botVoiceChannel.leave();
    return receivedMessage.say("Successfully Disconnected")

  }
};
