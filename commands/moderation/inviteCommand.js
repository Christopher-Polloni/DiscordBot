const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class inviteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            group: 'moderation',
            memberName: 'invite',
            description: 'Generate an invite for this server.',
            examples: [`invite`],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['CREATE_INSTANT_INVITE']
        })
    }
    async run(receivedMessage) {
        let guild = receivedMessage.guild;
        let channel = receivedMessage.guild.channels.cache.find(channel => channel.id === guild.guildSettings.welcomeSettings.welcomeChannelId);
        if (!channel) {
            channel = guild.systemChannel;
            if (!channel){
                channel = guild.channels.cache.last();
            }
        }
        return createLink(receivedMessage, channel, guild);
    }
};

async function createLink(receivedMessage, channel, guild) {
    let invite = await channel.createInvite({ maxAge: 0, unique: false }).catch(console.error);
    try {
        receivedMessage.author.send(`${guild.name} | ${invite}`);
        receivedMessage.say(`Invite was sent to your DM!`);
    } catch (e) {
        receivedMessage.say(`${guild.name} | no link available`);
    }
}