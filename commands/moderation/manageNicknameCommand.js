const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class nicknameCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'managenickname',
            group: 'moderation',
            memberName: 'managenickname',
            description: 'Change the nickname of a member in a server.',
            examples: ['managenickname <user> <new nickname>'],
            guildOnly: true,
            argsType: 'multiple',
            userPermissions: ['MANAGE_NICKNAMES']
        })
    }
    async run(receivedMessage, args) {
        if (!args) {
            return receivedMessage.say(`You didn't mention who's nickname to change or what to change it to.\n\`managenickname <user> <new nickname>\``)
        }
        else {
            const user = receivedMessage.mentions.users.first();
            if (user) {
                const member = receivedMessage.guild.member(user)
                if (member) {
                    args.shift()
                    let newNickname = args.join(' ')
                    if (newNickname == '') {
                        return receivedMessage.say(`You forgot to give the new nickname in your input.\n\`managenickname <user> <new nickname>\``)
                    }
                    else {
                        member.setNickname(newNickname)
                            .then(() => {
                                return receivedMessage.say(`Successfully changed ${member.user.username}'s nickname.`);
                            })
                            .catch(err => {
                                console.error(err);
                                return receivedMessage.say(`I was unable to change ${member.user.username}'s nickname.`);
                            });
                    }
                }
            }
            else {
                return receivedMessage.say(`You either didn't mention who's nickname to change or what to change it to.\n\`managenickname <user> <new nickname>\``);
            }

        }
    }
};
