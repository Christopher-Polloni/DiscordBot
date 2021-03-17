const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class botInviteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'bot-info',
            group: 'util',
            memberName: 'bot-info',
            description: 'Receive information about the bot, including an invite link, support server link and a link to upvote boop on top.gg',
            examples: [`botinfo`],
            guildOnly: false,
        })
    }
    async run(receivedMessage) {
        const embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setDescription(`**Important Links**
[Support Server](https://discord.gg/HKUPd8Wgfk) - Get bot support if you're having issues, leave feedback or feature requests, report bugs, and be informed about new features!
[Patreon](https://www.patreon.com/discord_bot_boop) - Help support the bot development and even get some free merchandise after your first 3 pledges to a tier!
[Top.gg](https://Top.gg/bot/575416249400426506) - <@575416249400426506>'s page on Top.gg!
[Top.gg Vote](https://Top.gg/bot/575416249400426506/vote) - Vote for <@575416249400426506> on Top.gg to get it trending!
[Invite](https://discord.com/oauth2/authorize?client_id=575416249400426506&permissions=2081418495&scope=bot) - Add the bot to another server!`)
            .attachFiles({
                attachment: `https://top.gg/api/widget/575416249400426506.png?v=${(Date.now() >> 0).toString(36)}`,
                name: "Widget.png"
            })
            .setImage("attachment://Widget.png")
            .setFooter('Upvotes reset every month')
        receivedMessage.say(embed)
    }

};
