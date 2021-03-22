const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const schedule = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require('mongodb').ObjectID;

module.exports = class cancelPollCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'cancel-poll',
            group: 'server poll',
            memberName: 'cancel-poll',
            description: 'Cancel the scheduled announcement of results for a server poll.',
            examples: ['cancel-poll <ID>'],
            guildOnly: true,
        })
    }
    async run(receivedMessage, args) {

        return cancelServerPoll(receivedMessage, args);

    };

}


async function cancelServerPoll(receivedMessage, id) {

    try {
        const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        await client2.connect();

        let results = await client2.db("DiscordBot").collection("Polls")
            .find({ guildId: receivedMessage.guild.id, messageId: id })
            .toArray()
       
        if (results.length == 0) {
            receivedMessage.say(`This server poll does not exist. Run the \`view-polls\` command to see which polls are active in this server.`)
        }
        else {

            deletion = await client2.db("DiscordBot").collection("Polls")
                .deleteOne({ messageId: id });

            const embed = new Discord.MessageEmbed()
                .setColor('#FF0000')
                .setTitle('📊 Upcoming Poll Result Announcement Cancelled!')
                .setDescription(`[${results[0].question}](${results[0].messageUrl})`)
            receivedMessage.say(embed)

            const channel = receivedMessage.guild.channels.cache.find(ch => ch.id === results[0].channelId);
            const message = await channel.messages.fetch(results[0].messageId)


            const newEmbed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setDescription(results[0].pollOptions)
            message.edit(`📊 ${results[0].question}`, newEmbed)
            

            const thisJob = 'poll_' + results[0]._id;
            schedule.cancelJob(thisJob);

        }
    } catch (e) {
        console.error(e);
        receivedMessage.say('There was an error cancelling the automatic announcment of your poll results. Please try again')
    } finally {
        await client2.close();
    }

}
