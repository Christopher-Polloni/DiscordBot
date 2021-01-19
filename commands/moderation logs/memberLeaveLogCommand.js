const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')

module.exports = class memberLeaveLogCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'leave-log',
            aliases: ['leavelog'],
            group: 'moderation logs',
            memberName: 'leave-log',
            description: 'Set a channel for a message to be sent in when a user leaves the server.',
            examples: ['leave-log', 'leave-log update', 'leave-log off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.moderationLogs.memberLeaveLogChannelId) {
                const embed = new Discord.MessageEmbed()
                    .setTitle('Moderation Log Settings - Member Left')
                    .setColor('BLUE')
                    .addField('Log Channel:', `<#${receivedMessage.guild.guildSettings.moderationLogs.memberLeaveLogChannelId}>`)
                    .setFooter(`To update these settings, use the command \`leave-log update\`\nTo turn off this setting, use the command \`leave-log off\``)
                return receivedMessage.say(embed)
            }
            else {
                return receivedMessage.say(`A channel for a message to be sent in when a member leaves ${receivedMessage.guild.name} is not set.\nTo update these settings, use the command \`leave-log update\``);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getChannel(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteMemberLeaveLogSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`leave-log\`, \`leave-log update\` or \`leave-log off\``);
        }
    }
};

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel for a message to be sent when someone leaves ${receivedMessage.guild.name} (using the format <#${receivedMessage.channel.id}>).`).then((newmsg) => {
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
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `leave-log update`");
            });
    });
}

async function upsertModerationLogSetting(receivedMessage, channelId) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberLeaveLogChannelId: channelId } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.memberLeaveLogChannelId = channelId;
        return receivedMessage.say(`Moderation Log Settings were updated for members leaving`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `leave-log update`")
    }
}

async function deleteMemberLeaveLogSetting(receivedMessage) {
    if (!receivedMessage.guild.guildSettings.moderationLogs.memberLeaveLogChannelId) {
        return receivedMessage.say(`Moderation Log Setting for members leaving was already turned off`);
    }
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberLeaveLogChannelId: null } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.memberLeaveLogChannelId = null;
        return receivedMessage.say(`Moderation Log Setting for members leaving is now turned off`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `leave-log off`")
    }
}