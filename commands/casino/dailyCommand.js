const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class dailyCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'daily',
            group: 'casino',
            memberName: 'daily',
            description: 'Receive 2,500 credits for free every day.',
            examples: ['daily'],
            guildOnly: false,
            argsType: 'single',
        })
    }
    async run(receivedMessage, args) {
        if (!receivedMessage.author.casino.setup) {
            return receivedMessage.say('You must first set up your casino account before using any casino commands. To do this, simply run the `casino-setup` command.')
        }
        else if (!receivedMessage.author.casino.dailyCooldown) {
            receivedMessage.author.casino.dailyCooldown = new Date()
            receivedMessage.author.casino.balance = receivedMessage.author.casino.balance + 2500
            const embed = new Discord.MessageEmbed()
                .setColor('GREEN')
                .addField('Credits Added', '2,500', true)
                .addField('New Balance', receivedMessage.author.casino.balance.toLocaleString(), true)
                .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            return receivedMessage.say(embed)
        }
        else {
            const now = new Date()
            const oneDay = 1000 * 60 * 60 * 24;
            const dayHasPassed = (now - receivedMessage.author.casino.dailyCooldown) > oneDay;
            if (dayHasPassed) {
                receivedMessage.author.casino.dailyCooldown = now
                receivedMessage.author.casino.balance = receivedMessage.author.casino.balance + 2500
                const embed = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .addField('Credits Added', '2,500', true)
                    .addField('New Balance', receivedMessage.author.casino.balance.toLocaleString(), true)
                    .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                return receivedMessage.say(embed)
            }
            else {

                const timeDiff = new Date(receivedMessage.author.casino.dailyCooldown) - new Date(now + oneDay)
                const humanTime = new Date(timeDiff).toISOString().substring(11, 19);
                const embed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setDescription('You already collected your free credits today.')
                    .addField('Time Until Next Available Claim', humanTime, true)
                    .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                return receivedMessage.say(embed)
            }
        }

    }
};
