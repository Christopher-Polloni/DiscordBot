const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class nicknameCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'nickname',
            group: 'miscellaneous',
            memberName: 'nickname',
            description: 'Change your nickname in a server.',
            examples: ['nickname <new nickname>'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['CHANGE_NICKNAME']
        })
    }
    async run(receivedMessage, arg) {
        if (receivedMessage.author.id == receivedMessage.guild.ownerID){
            return receivedMessage.say(`I don't have the authority to change the server owner's nickname.`)
        }
        else if (arg) {
            const member = receivedMessage.guild.member(receivedMessage.author)
            member.setNickname(arg)
                .then(() => {
                    return receivedMessage.say(`Successfully changed your nickname to \`${arg}\``);
                })
                .catch(err => {
                    console.error(err);
                    return receivedMessage.reply('I was unable to change your nickname');
                });
        }
        else {
            return receivedMessage.say(`You didn't say what your new nickname should be!\n\`nickname <new nickname>\``)
        }
    }
};
