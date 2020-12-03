const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class disconnectCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'disconnect',
            aliases: ['dc'],
            group: 'music',
            memberName: 'disconnect',
            description: 'Clear the queue and have the bot disconnect from the voice channel.',
            examples: ['disconnect'],
            guildOnly: true,
            argsType: 'single'
        })
    }
    async run(receivedMessage, args) {
        try {
            const memberVoiceChannel = receivedMessage.member.voice.channel;
            const botVoiceChannel = this.client.voice.connections.get(receivedMessage.guild.id).channel
            if (botVoiceChannel == memberVoiceChannel) {
                receivedMessage.guild.musicData.queue = [];
                receivedMessage.guild.musicData.isPlaying = false;
                receivedMessage.guild.musicData.songDispatcher = null
                botVoiceChannel.leave();
                return receivedMessage.say("Successfully Disconnected")
            }
            else {
                return receivedMessage.say('You must be in the same voice channel as the bot to use the `disconnect` command.');    
            }
        } catch (error) {
            return receivedMessage.say('You must be in the same voice channel as the bot to use the `disconnect` command.');
        }

    }
};
