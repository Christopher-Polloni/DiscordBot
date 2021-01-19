const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')

module.exports = class messageEditLogCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'message-edit-log',
            aliases: ['messageeditlog'],
            group: 'moderation logs',
            memberName: 'message-edit-log',
            description: 'Set a channel for a message to be sent in when a message is edited in the server (not bot messages).',
            examples: ['message-edit-log', 'message-edit-log update', 'message-edit-log off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.moderationLogs.messageEditLogChannelId) {
                const embed = new Discord.MessageEmbed()
                    .setTitle('Moderation Log Settings - Message Edits')
                    .setColor('BLUE')
                    .addField('Log Channel:', `<#${receivedMessage.guild.guildSettings.moderationLogs.messageEditLogChannelId}>`)
                    .setFooter(`To update these settings, use the command \`message-edit-log update\`\nTo turn off this setting, use the command \`message-edit-log off\``)
                return receivedMessage.say(embed)
            }
            else {
                return receivedMessage.say(`A channel for a message to be sent in when a message is edited by a user in ${receivedMessage.guild.name} is not set.\nTo update these settings, use the command \`message-edit-log update\``);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getChannel(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteMessageEditLogSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`message-edit-log\`, \`message-edit-log update\` or \`message-edit-log off\``);
        }
    }
};

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel for a message to be sent in when a message is edited by a user in ${receivedMessage.guild.name} (using the format <#${receivedMessage.channel.id}>).`).then((newmsg) => {
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
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-edit-log update`");
            });
    });
}

async function upsertModerationLogSetting(receivedMessage, channelId) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageEditLogChannelId: channelId } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.messageEditLogChannelId = channelId;
        return receivedMessage.say(`Moderation Log Settings were updated for users editing messages.`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-edit-log update`")
    }
}

async function deleteBanLogSetting(receivedMessage) {
    if (!receivedMessage.guild.guildSettings.moderationLogs.messageEditLogChannelId) {
        return receivedMessage.say(`Moderation Log Setting for users being banned or unbanned was already turned off`);
    }
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageEditLogChannelId: null } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.messageEditLogChannelId = null;
        return receivedMessage.say(`Moderation Log Setting for users editing messages is now turned off`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-edit-log off`")
    }
}