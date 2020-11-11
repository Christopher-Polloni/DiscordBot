const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = class scheduleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'viewservermessages',
            group: 'serverreminders',
            memberName: 'viewservermessages',
            description: 'View your scheduled messages for the server you run the command in.',
            examples: ['viewservermessages'],
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

        const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        // Connect to the MongoDB cluster
        await client2.connect();

        let filter = {
            guildID: receivedMessage.guild.id
        }

        let results = await client2.db("DiscordBot").collection("Server Messages")
            .find(filter)
            .sort({ date: 1 })
            .toArray()
        console.log(results)

        for (let i = 0; i < results.length; i++) {

            const embed = new Discord.MessageEmbed()
                .setColor('#0000FF')
                .setTitle("Upcoming Server Message")
                .setAuthor(results[i].authorName, results[i].authorAvatarUrl)
                .setDescription(`Date: ${results[i].date.toLocaleString()} ${config.timeZone}\nChannel: <#${results[i].channelID}>\nMessage:\n${results[i].message}`)
                .setFooter(`${i + 1}/${results.length} Messages | $deletemessage ${results[i]._id}`)
            receivedMessage.say(embed);
        }
    } catch (e) {
        console.error(e);
        receivedMessage.reply('There was an error uploading your reminder. Please try again')
    } finally {
        await client2.close();
    }
}
