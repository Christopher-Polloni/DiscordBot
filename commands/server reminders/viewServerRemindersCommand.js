const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const paginationEmbed = require('discord.js-pagination');
const serverMessagesSchema = require('../../schemas/serverMessagesSchema.js');

module.exports = class scheduleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'view-server-messages',
            group: 'serverreminders',
            memberName: 'view-server-messages',
            description: 'View your scheduled messages for the server you run the command in.',
            examples: ['view-server-messages'],
            guildOnly: true,
        })
    }
    async run(receivedMessage) {

        if (receivedMessage.channel.name.toLowerCase() == 'scheduler') {
            return viewScheduledMessages(receivedMessage);
        }
        else {
            return receivedMessage.say(`This command can only be used in a channel named 'scheduler'.\nOnly those with access to this channel can use the command.\nThis is to prevent members of your server from seeing messages before they are supposed to.`)
        }

    };

}

async function viewScheduledMessages(receivedMessage) {

    try {

        let results = await serverMessagesSchema.find({ guildId: receivedMessage.guild.id}).sort({ date: 1 })

        if (results.length == 0){
            return receivedMessage.send(`There are not currently any scheduled messages set for ${receivedMessage.guild.name}.`)
        }

        let pages = []
        for (let i = 0; i < results.length; i++) {
            const embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle(`Upcoming Server Message - ${i+1}`)
                .setAuthor(results[i].authorName, results[i].authorAvatarUrl)
                .setDescription(`**Scheduled For:** ${results[i].date.toLocaleString()} ${config.timeZone}\n**Channel:** <#${results[i].channelId}>\n**Message:**\n${results[i].message || ''}`)
            if (results[i].image){
                embed.setImage(results[i].image)
              } 
              else if (results[i].gif){
                embed.setImage(results[i].gif)
              }
            pages.push(embed)
        }
        paginationEmbed(receivedMessage, pages, ['◀️', '▶️'], 120000);
    } catch (e) {
        console.error(e);
        receivedMessage.reply('There was an error showing your reminders. Please try again')
    }
}
