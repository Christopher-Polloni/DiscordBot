const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class botInviteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'botinfo',
            aliases: ['bot-info'],
            group: 'util',
            memberName: 'botinfo',
            description: 'Receive information about the bot, including an invite link and support server link',
            examples: [`botinvite`],
            guildOnly: false,
        })
    }
    async run(receivedMessage) {
        const embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .addField('Bot Invite', 'https://bit.ly/3lZCLoL', true)
            .addField('Support Server Invite', 'https://discord.gg/HKUPd8Wgfk', true)
            .addField('Upvote Link', 'https://top.gg/bot/575416249400426506/vote', true)
            .attachFiles({
                attachment: `https://top.gg/api/widget/575416249400426506.png?v=${(Date.now() >> 0).toString(36)}`,
                name: "Widget.png"
                })
            .setImage("attachment://Widget.png")
            .setFooter('Upvotes reset every month')
        receivedMessage.say(embed)
    }

};
