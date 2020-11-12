const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class kickCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'moderation',
            memberName: 'kick',
            description: 'Kick a member from the server.',
            examples: ['kick <user>', 'kick <user> <reason>'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['KICK_MEMBERS']
        })
    }
    async run(receivedMessage, arg) {
        const user = receivedMessage.mentions.users.first();
        if (user) {
            const member = receivedMessage.guild.member(user);
            if (member) {
                member.kick(arg)
                    .then(() => {
                        receivedMessage.say(`Successfully kicked ${user.tag}`);
                    })
                    .catch(err => {
                        receivedMessage.say('I was unable to kick the member');
                        console.error(err);
                    });
            }
            else {
                receivedMessage.say(`${user.tag} is not currently in this server`)
            }
        }
        else {
            receivedMessage.say(`You either didn't mention the user to kick or the user mentioned was just recently kicked!`);
        }
    }
};
