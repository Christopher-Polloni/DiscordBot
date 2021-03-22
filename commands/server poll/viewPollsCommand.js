const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const schedule = require('node-schedule');

module.exports = class viewPollsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'view-polls',
            group: 'server poll',
            memberName: 'view-polls',
            description: 'View any active polls in the server. This will only show polls that have a date for when the results will automatically be announced.',
            examples: [`view-polls`],
            guildOnly: true,
            argsType: 'single'
        })
    }
    async run(receivedMessage, args) {
        try {

            const client2 = new MongoClient(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

            await client2.connect();

            let filter = {
                guildId: receivedMessage.guild.id
            }

            let results = await client2.db("DiscordBot").collection("Polls")
                .find(filter)
                .sort({ date: 1 })
                .toArray()

            let description = ''
            for (let i = 0; i < results.length; i++) {
                let question = results[i].question
                if (question.length > 50){
                    question = question.substring(0, 99) + '...'
                }
                description = description + `[${question}](${results[i].messageUrl})\nResult Date: ${results[i].date.toLocaleString()} ${config.timeZone}\nID: ${results[i].messageId}\n\n`
            }
            const embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle("📊 Upcoming Poll Results")
                .setDescription(description)
                .setFooter('To cancel the automatic announcment of results on a poll: cancel-poll <ID>')
            receivedMessage.say(embed);

        } catch (e) {
            console.error(e);
            receivedMessage.reply('There was an error retreiving your polls. Please try again')
        }
    }
};


