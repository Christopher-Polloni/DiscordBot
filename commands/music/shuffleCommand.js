const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');


module.exports = class memeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'shuffle',
            group: 'music',
            memberName: 'shuffle',
            description: 'Shuffle the queue.',
            examples: ['shuffle'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
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
                    let queue = receivedMessage.guild.musicData.queue;
                    const currentlyPlaying = queue[0];
                    for (var i = queue.length - 1; i > 1; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = queue[i];
                        queue[i] = queue[j];
                        queue[j] = temp;
                    }
                    let x = queue.indexOf(currentlyPlaying);
                    let temporary = queue[0];
                    queue[0] = currentlyPlaying;
                    queue[x] = temporary;
                    receivedMessage.guild.musicData.queue = queue;
                    const shuffleGifOptions = ["https://media1.tenor.com/images/8b298e73e936f679b3b0a88c273c9800/tenor.gif?itemid=14668571", "https://media1.tenor.com/images/6a507c337307bdae4b6c4f9d86d45db8/tenor.gif?itemid=16263620", "https://media1.tenor.com/images/8944684c2e52dd492756abd6d75717a1/tenor.gif?itemid=9473795"];
                    const selectedShuffleGif = shuffleGifOptions[Math.floor(Math.random() * shuffleGifOptions.length)];
                    const embed = new Discord.MessageEmbed()
                        .setColor('RANDOM')
                        .setTitle(`Queue for ${receivedMessage.guild.name} has been shuffled!`)
                        .setImage(selectedShuffleGif)
                    return receivedMessage.channel.send(embed);
                }
            }
            else {
                return receivedMessage.say('You must be in the same voice channel as the bot to use the `shuffle` command.');
            }
        } catch (error) {
            return receivedMessage.say('You must be in the same voice channel as the bot to use the `shuffle` command.');
        }
    }
};