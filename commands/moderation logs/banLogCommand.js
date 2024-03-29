const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')
const moderationLogsSettingsSchema = require('../../schemas/moderationLogsSettingsSchema');

module.exports = class banLogCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ban-log',
            aliases: ['banlog'],
            group: 'moderation logs',
            memberName: 'ban-log',
            description: 'Set a channel for a message to be sent in when a user is banned or unbanned from the server',
            examples: ['ban-log', 'ban-log update', 'ban-log off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.moderationLogs.banLogChannelId) {
                const embed = new Discord.MessageEmbed()
                    .setTitle('Moderation Log Settings - User Banned/Unbanned')
                    .setColor('BLUE')
                    .addField('Log Channel:', `<#${receivedMessage.guild.guildSettings.moderationLogs.banLogChannelId}>`)
                    .setFooter(`To update these settings, use the command \`ban-log update\`\nTo turn off this setting, use the command \`ban-log off\``)
                return receivedMessage.say(embed)
            }
            else {
                return receivedMessage.say(`A channel for a message to be sent in when a user is banned or unbanned from ${receivedMessage.guild.name} is not set.\nTo update these settings, use the command \`ban-log update\``);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getChannel(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteBanLogSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`ban-log\`, \`ban-log update\` or \`ban-log off\``);
        }
    }
};

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel for a message to be sent in when a user is banned or unbanned from ${receivedMessage.guild.name} (using the format <#${receivedMessage.channel.id}>).`).then((newmsg) => {
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
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `ban-log update`");
            });
    });
}

async function upsertModerationLogSetting(receivedMessage, channelId) {
    try {
        result = await moderationLogsSettingsSchema.updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, banLogChannelId: channelId } }, { upsert: true });
        receivedMessage.guild.guildSettings.moderationLogs.banLogChannelId = channelId;
        return receivedMessage.say(`Moderation Log Settings were updated for users being banned or unbanned.`);
    } catch (e) {
        console.error(`Error updating Moderation Log (ban log). Guild ID: ${receivedMessage.guild.id}`, e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `ban-log update`")
    }
}

async function deleteBanLogSetting(receivedMessage) {
    if (!receivedMessage.guild.guildSettings.moderationLogs.banLogChannelId) {
        return receivedMessage.say(`Moderation Log Setting for users being banned or unbanned was already turned off`);
    }
    try {
        result = await moderationLogsSettingsSchema.updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, banLogChannelId: null } }, { upsert: true });
        receivedMessage.guild.guildSettings.moderationLogs.banLogChannelId = null;
        return receivedMessage.say(`Moderation Log Setting for users being banned or unbanned is now turned off`);
    } catch (e) {
        console.error(`Error turning off Moderation Log (ban log). Guild ID: ${receivedMessage.guild.id}`, e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `ban-log off`")
    }
}