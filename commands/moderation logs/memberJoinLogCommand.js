const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class memberJoinLogCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'join-log',
            aliases: ['joinlog'],
            group: 'moderation logs',
            memberName: 'join-log',
            description: 'Set a channel for a message to be sent in when a user joins the server.',
            examples: ['join-log', 'join-log update', 'join-log off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId) {
                let memberJoinLogChannelId = receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId;
                receivedMessage.say(`${receivedMessage.guild.name} member join log messages are set to be sent in <#${memberJoinLogChannelId}> with the following message:`)
                receivedMessage.say(`To update these settings, use the command \`join-log update\`\nTo turn off this setting, use the command \`join-log off\``)
            }
            else {
                return receivedMessage.say(`A channel for a message to be sent in when a member joins ${receivedMessage.guild.name} is not set.\nTo update these settings, use the command \`join-log update\``);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getChannel(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteMemberJoinLogSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`join-log\`, \`join-log update\` or \`join-log off\``);
        }
    }
};

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel for a message to be sent when someone joins ${receivedMessage.guild.name} (using the format <#${receivedMessage.channel.id}>).`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                if (messages.first().mentions.channels.first()) {
                    const channelId = messages.first().mentions.channels.first().id;
                    return upsertModerationLogSetting(receivedMessage, channelId);
                }
                else {
                    receivedMessage.say("You didn't properly mention a channel.");
                    return getChannel(receivedMessage);
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `join-log update`");
            });
    });
}

async function upsertModerationLogSetting(receivedMessage, channelId) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberJoinLogChannelId: channelId } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId = channelId;
        return receivedMessage.say(`Moderation Log Settings were updated for members joining`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `join-log update`")
    }
}

async function deleteMemberJoinLogSetting(receivedMessage) {
    if (!receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId) {
        return receivedMessage.say(`Moderation Log Setting for members joining is already turned off`);
    }
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberJoinLogChannelId: null } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId = null;
        return receivedMessage.say(`Moderation Log Setting for members joining is now turned off`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `join-log off`")
    }
}