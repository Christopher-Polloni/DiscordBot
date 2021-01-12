const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class memberNicknameChangeLogCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'nickname-log',
            aliases: ['nicknamelog'],
            group: 'moderation logs',
            memberName: 'nickname-log',
            description: 'Set a channel for a message to be sent in when a user changes their nickname in the server',
            examples: ['nickname-log', 'nickname-log update', 'nickname-log off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId) {
                let memberNicknameChangeLogChannelId = receivedMessage.guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId;
                receivedMessage.say(`${receivedMessage.guild.name} member nickname change log messages are set to be sent in <#${memberNicknameChangeLogChannelId}>`)
                receivedMessage.say(`To update these settings, use the command \`nickname-log update\`\nTo turn off this setting, use the command \`nickname-log off\``)
            }
            else {
                return receivedMessage.say(`A channel for a message to be sent in when a member changes their nickname in  ${receivedMessage.guild.name} is not set.\nTo update these settings, use the command \`nickname-log update\``);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getChannel(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteMemberNicknameChangeLogSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`nickname-log\`, \`nickname-log update\` or \`nickname-log off\``);
        }
    }
};

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel for a message to be sent when someone changes their nickname in ${receivedMessage.guild.name} (using the format <#${receivedMessage.channel.id}>).`).then((newmsg) => {
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
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `nickname-log update`");
            });
    });
}

async function upsertModerationLogSetting(receivedMessage, channelId) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberNicknameChangeLogChannelId: channelId } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId = channelId;
        return receivedMessage.say(`Moderation Log Settings were updated for members changing their nickname`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `nickname-log update`")
    }
}

async function deleteMemberNicknameChangeLogSetting(receivedMessage) {
    if (!receivedMessage.guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId) {
        return receivedMessage.say(`Moderation Log Setting for members changing their nickname was already turned off`);
    }
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberNicknameChangeLogChannelId: null } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.memberNicknameChangeLogChannelId = null;
        return receivedMessage.say(`Moderation Log Setting for members changing their nickname is now turned off`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `nickname-log off`")
    }
}