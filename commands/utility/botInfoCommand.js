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
            description: 'Receive information about the bot, including an invite link, support server link and a link to upvote boop on top.gg',
            examples: [`botinvite`],
            guildOnly: false,
        })
    }
    async run(receivedMessage) {
        const embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .addField('Bot Invite', '[Click Here](https://discord.com/oauth2/authorize?client_id=575416249400426506&permissions=8&scope=bot)', true)
            .addField('Support Server Invite', '[Click Here](https://discord.gg/HKUPd8Wgfk)', true)
            .addField('Upvote Link', '[Click Here](https://top.gg/bot/575416249400426506/vote)', true)
            .attachFiles({
                attachment: `https://top.gg/api/widget/575416249400426506.png?v=${(Date.now() >> 0).toString(36)}`,
                name: "Widget.png"
                })
            .setImage("attachment://Widget.png")
            .setFooter('Upvotes reset every month')
        receivedMessage.say(embed)
    }

};
