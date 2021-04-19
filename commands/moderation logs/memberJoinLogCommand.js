const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')
const moderationLogsSettingsSchema = require('../../schemas/moderationLogsSettingsSchema');

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
                const embed = new Discord.MessageEmbed()
                    .setTitle('Moderation Log Settings - Member Join')
                    .setColor('BLUE')
                    .addField('Log Channel:', `<#${receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId}>`)
                    .setFooter(`To update these settings, use the command \`join-log update\`\nTo turn off this setting, use the command \`join-log off\``)
                return receivedMessage.say(embed)
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
    try {
        result = await moderationLogsSettingsSchema.updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberJoinLogChannelId: channelId } }, { upsert: true });
        receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId = channelId;
        return receivedMessage.say(`Moderation Log Settings were updated for members joining`);
    } catch (e) {
        console.error(`Error updating Moderation Log (member-join log). Guild ID: ${receivedMessage.guild.id}`, e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `join-log update`")
    }
}

async function deleteMemberJoinLogSetting(receivedMessage) {
    if (!receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId) {
        return receivedMessage.say(`Moderation Log Setting for members joining is already turned off`);
    }
    try {
        result = await moderationLogsSettingsSchema.updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, memberJoinLogChannelId: null } }, { upsert: true });
        receivedMessage.guild.guildSettings.moderationLogs.memberJoinLogChannelId = null;
        return receivedMessage.say(`Moderation Log Setting for members joining is now turned off`);
    } catch (e) {
        console.error(`Error turning off Moderation Log (member-join log). Guild ID: ${receivedMessage.guild.id}`, e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `join-log off`")
    }
}