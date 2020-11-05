const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class banCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'moderation',
            memberName: 'ban',
            description: 'Ban a member from the server.',
            examples: ['ban <user>', 'ban <user> <reason>'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['BAN_MEMBERS']
        })
    }
    async run(receivedMessage, arg) {
        const user = receivedMessage.mentions.users.first();
        if (user) {
            const member = receivedMessage.guild.member(user);
            if (member) {
                member.ban({ reason: arg })
                    .then(() => {
                        receivedMessage.say(`Successfully banned ${user.tag}`);
                    })
                    .catch(err => {
                        message.reply('I was unable to ban the member');
                        console.error(err);
                    });
            }
            else {
                receivedMessage.say(`${user.tag} is not currently in this server`)
            }
        }
        else {
            receivedMessage.say(`You either didn't mention the user to ban or the user mentioned just recently left!`);
        }
    }
};
