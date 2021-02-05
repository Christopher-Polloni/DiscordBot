const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class creditsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'credits',
            aliases: ['credit', 'balance'],
            group: 'casino',
            memberName: 'credits',
            description: 'View how many casino credits you have.',
            examples: ['credits'],
            guildOnly: false,
            argsType: 'single',
        })
    }
    async run(receivedMessage, args) {
        if (!receivedMessage.author.casino.setup) {
            return receivedMessage.say('You must first set up your casino account before using any casino commands. To do this, simply run the `casino-setup` command.')
        }
        else {
            const embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .addField('Your Total Credits', `${receivedMessage.author.casino.balance.toLocaleString()} credits`)
                .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            return receivedMessage.say(embed)
        }

    }
};
