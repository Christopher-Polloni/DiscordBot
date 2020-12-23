const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const schedule = require('node-schedule');
const axios = require('axios');
const moment = require('moment');

module.exports = class cocWarCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'coc-war',
            group: 'coc',
            memberName: 'coc-war',
            aliases: ['cocwar'],
            description: 'Run this command when you are in preparation day and messages will automatically be sent 30 minutes prior to prep day and war day ending if properly configured using the coc-settings command.',
            examples: ['coc-war'],
            guildOnly: true,
            ownerOnly: true,
            hidden: true
        })
    }
    async run(receivedMessage) {
        axios({
            baseURL: 'https://api.clashofclans.com/v1/',
            url: `clans/${encodeURIComponent(receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag)}/currentwar`,
            method: 'get',
            headers: {
                authorization: `Bearer ${config.clashOfClansApiKey}`
            },
            responseType: 'application/json'
        }).then(function (response) {
            if (response.data.state == "preparation") {
                return checkStatusOfReminders(receivedMessage, response.data)
            }
            else {
                return receivedMessage.say(`${response.data.clan.name} (${response.data.clan.tag}) is not currently in Preparation Day.`)
            }
        }).catch(function (error) {
            console.log(error);
            return receivedMessage.say(`Could not find a clan with the tag \`${receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag}\`\nIf this tag is incorrect, please update your settings with the command with \`coc-settings update\``)
        })
    }
};


async function checkStatusOfReminders(receivedMessage, data) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        let filter = {
            guild: receivedMessage.guild.id
        }
        let result = await client2.db("DiscordBot").collection("Clash of Clans Reminders")
            .find(filter)
            .toArray()
        await client2.close();

        if (result.length > 0) {
            return receivedMessage.say(`The \`coc-war\` command has already been run for the war you are currently in (${data.clan.name} vs ${data.opponent.name})`)
        }
        else {
            return setReminders(receivedMessage, data)
        }
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error. You can restart the process with `coc-war`")
    }
}

async function setReminders(receivedMessage, data) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const preparationReminder = {
        type: "preparation",
        guild: receivedMessage.guild.id,
        endingTime: new Date(new Date(moment(data.startTime).format())),
        messageTime: new Date(new Date(moment(data.startTime).format()) - 1800000),
        clanTag: receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag,
        clanName: receivedMessage.guild.guildSettings.clashOfClansSettings.clanName,
        cocReminderChannelId: receivedMessage.guild.guildSettings.clashOfClansSettings.cocReminderChannelId,
        preparationEndWarning: receivedMessage.guild.guildSettings.clashOfClansSettings.preparationEndWarning,
        preparationEndWarningMentions: receivedMessage.guild.guildSettings.clashOfClansSettings.preparationEndWarningMentions,
    }

    const warReminder = {
        type: "war",
        guild: receivedMessage.guild.id,
        endingTime: new Date(new Date(moment(data.endTime).format())),
        messageTime: new Date(new Date(moment(data.endTime).format()) - 1800000),
        clanTag: receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag,
        clanName: receivedMessage.guild.guildSettings.clashOfClansSettings.clanName,
        cocReminderChannelId: receivedMessage.guild.guildSettings.clashOfClansSettings.cocReminderChannelId,
        warEndWarning: receivedMessage.guild.guildSettings.clashOfClansSettings.warEndWarning,
        warEndWarningMentions: receivedMessage.guild.guildSettings.clashOfClansSettings.warEndWarningMentions
    }
    try {
        await client2.connect();
        let result1 = await client2.db("DiscordBot").collection("Clash of Clans Reminders").insertOne(preparationReminder);
        let result2 = await client2.db("DiscordBot").collection("Clash of Clans Reminders").insertOne(warReminder);

        const channel = receivedMessage.guild.channels.cache.find(channel => channel.id === warReminder.cocReminderChannelId);

        const preparationEndEmbed = new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Clash of Clans Reminder")
            .addField('Clan Name', receivedMessage.guild.guildSettings.clashOfClansSettings.clanName, true)
            .addField('Clan Tag', receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag, true)
            .addField('Preparation Ends in 30 Minutes', preparationReminder.preparationEndWarning)
            .setTimestamp()

        const warEndEmbed = new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Clash of Clans Reminder")
            .addField('Clan Name', receivedMessage.guild.guildSettings.clashOfClansSettings.clanName, true)
            .addField('Clan Tag', receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag, true)
            .addField('War Ends in 30 Minutes', warReminder.warEndWarning)
            .setTimestamp()


        schedule.scheduleJob('cocReminder_' + result1.insertedId, preparationReminder.messageTime, async function () {
            try {
                channel.send(preparationEndEmbed);
                if (preparationReminder.preparationEndWarningMentions !== '') {
                    channel.send(`The following were mentioned above: ${preparationReminder.preparationEndWarningMentions}`);
                }
            } catch (e) {
                console.error(e);
            } finally {
                deletion = await client2.db("DiscordBot").collection("Clash of Clans Reminders")
                    .deleteOne({ _id: result1.insertedId });
            }
        });

        schedule.scheduleJob('cocReminder_' + result2.insertedId, warReminder.messageTime, async function () {
            try {
                channel.send(warEndEmbed);
                if (preparationReminder.warEndWarningMentions !== '') {
                    channel.send(`The following were mentioned above: ${warReminder.warEndWarningMentions}`);
                }
            } catch (e) {
                console.error(e);
            } finally {
                deletion = await client2.db("DiscordBot").collection("Clash of Clans Reminders")
                    .deleteOne({ _id: result2.insertedId });
            }
        });

    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error. You can restart the process with `coc-war`")
    }


}


