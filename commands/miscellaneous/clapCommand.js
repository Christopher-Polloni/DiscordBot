const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');


module.exports = class clapCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'clap',
            group: 'miscellaneous',
            memberName: 'clap',
            description: '👏 Send 👏 messages 👏 like 👏 this 👏',
            examples: ['clap <message>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (!arg){
            return receivedMessage.say('You must include the message after saying `clap`.')
        }
        let regex = /\s/g
        let newArgs = arg.replace(regex, ' 👏 ');
        let prefix = '👏 ';
        let suffix = ' 👏';
        let text = prefix.concat(newArgs, suffix)
        if (text.length < 2049) {
            receivedMessage.delete()
                .then(() => {
                    const embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setDescription(text)
                        .setFooter(receivedMessage.author.username, receivedMessage.author.displayAvatarURL());
                    return receivedMessage.say(embed)
                })
                .catch(err => {
                    console.error(err);
                    const embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setDescription(text)
                        .setFooter(receivedMessage.author.username, receivedMessage.author.displayAvatarURL());
                    return receivedMessage.say(embed);
                });
        }
        else {
            return receivedMessage.say(`Message length exceeds the allowed value of 2048 characters in an embed`)
        }
    }
};
