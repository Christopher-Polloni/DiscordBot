const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const schedule = require('node-schedule');
const axios = require('axios');
const moment = require('moment');

module.exports = class cocSettingsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'coc-settings',
            group: 'coc',
            memberName: 'coc-settings',
            aliases: ['cocsettings'],
            description: 'Update your settings for Clash Of Clans war reminders.',
            examples: ['coc-settings'],
            guildOnly: true,
            ownerOnly: true,
            hidden: true,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag) {
                let clanTag = receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag;
                let clanName = receivedMessage.guild.guildSettings.clashOfClansSettings.clanName;
                let cocReminderChannelId = receivedMessage.guild.guildSettings.clashOfClansSettings.cocReminderChannelId;
                let preparationEndWarning = receivedMessage.guild.guildSettings.clashOfClansSettings.preparationEndWarning;
                let warEndWarning = receivedMessage.guild.guildSettings.clashOfClansSettings.warEndWarning;
                const embed = new Discord.MessageEmbed()
                    .setTitle("Clash of Clans Reminder Settings")
                    .addField('Clan Name', clanName, true)
                    .addField('Clan Tag', clanTag, true)
                    .addField('Channel', `<#${cocReminderChannelId}>`)
                    .addField('Preparation Ending Message', preparationEndWarning)
                    .addField('War Ending Message', warEndWarning)
                    .setFooter(`To update these settings, use the command: coc-settings update\nTo turn off this setting, use the command: coc-settings off`)
                return receivedMessage.say(embed)
            }
            else {
                return receivedMessage.say(`Clash of Clans reminder settings for ${receivedMessage.guild.name} are not set. To update these settings, use the command \`coc-settings update\``);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getClanTag(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteClashOfClansSettings(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`coc-settings\`, \`coc-settings update\` or \`coc-settings off\``);
        }

    }
};

async function getClanTag(receivedMessage) {
    receivedMessage.say(`Please enter the clan tag for the Clash of Clans clan you'd like to receive reminders about:`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                axios({
                    baseURL: 'https://api.clashofclans.com/v1/',
                    url: `clans/${encodeURIComponent(messages.first().content)}/currentwar`,
                    method: 'get',
                    headers: {
                        authorization: `Bearer ${config.clashOfClansApiKey}`
                    },
                    responseType: 'application/json'
                }).then(function (response) {
                    return getChannel(receivedMessage, response.data.clan.tag, response.data.clan.name)
                }).catch(function (error) {
                    console.log(error);
                    return receivedMessage.say(`Could not find a clan with the tag \`${messages.first().content}\`\nYou'll need to restart the command with \`coc-settings update\``)
                })
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `coc-settings update`");
            });
    });
}

async function getChannel(receivedMessage, clanTag, clanName) {
    receivedMessage.say(`Please enter the channel for Clash of Clans war reminders to be sent in using the format <#${receivedMessage.channel.id}>.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                if (messages.first().mentions.channels.first()) {
                    const channelId = messages.first().mentions.channels.first().id;
                    return getPreparationMessage(receivedMessage, clanTag, clanName, channelId);
                }
                else {
                    receivedMessage.say("You didn't properly mention a channel.");
                    return getChannel(receivedMessage, clanTag, clanName);
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `coc-settings update`");
            });
    });
}

async function getPreparationMessage(receivedMessage, clanTag, clanName, channelId) {
    receivedMessage.say(`Please enter the message you'd like to be sent 30 minutes prior to war starting.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                let userMentions = messages.first().mentions.users
                let userMentionsArray = userMentions.array()
                let roleMentions = messages.first().mentions.roles
                let roleMentionsArray = roleMentions.array()
                let preparationMentions = '';
                for (let i = 0; i < userMentionsArray.length; i++) {
                    preparationMentions = preparationMentions.concat(` <@${userMentionsArray[i].id}>`)
                }
                for (let i = 0; i < roleMentionsArray.length; i++) {
                    preparationMentions = preparationMentions.concat(` <@&${roleMentionsArray[i].id}>`)
                }
                let preparationMessage = messages.first().content;
                
                return getWarMessage(receivedMessage, clanTag, clanName, channelId, preparationMessage, preparationMentions);
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `coc-settings update`");
            });
    });
}

async function getWarMessage(receivedMessage, clanTag, clanName, channelId, preparationMessage, preparationMentions) {
    receivedMessage.say(`Please enter the message you'd like to be sent 30 minutes prior to war ending.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                let userMentions = messages.first().mentions.users
                let userMentionsArray = userMentions.array()
                let roleMentions = messages.first().mentions.roles
                let roleMentionsArray = roleMentions.array()
                let warMentions = '';
                for (let i = 0; i < userMentionsArray.length; i++) {
                    warMentions = warMentions.concat(` <@${userMentionsArray[i].id}>`)
                }
                for (let i = 0; i < roleMentionsArray.length; i++) {
                    warMentions = warMentions.concat(` <@&${roleMentionsArray[i].id}>`)
                }
                const warMessage = messages.first().content;
                
                const updatedSetting = {
                    guild: receivedMessage.guild.id,
                    clanTag: clanTag,
                    clanName: clanName,
                    cocReminderChannelId: channelId,
                    preparationEndWarning: preparationMessage,
                    preparationEndWarningMentions: preparationMentions,
                    warEndWarning: warMessage,
                    warEndWarningMentions: warMentions
                }
                return upsertClashOfClansSettings(receivedMessage, updatedSetting);
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `coc-settings update`");
            });
    });
}

async function upsertClashOfClansSettings(receivedMessage, updatedSetting) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Clash of Clans Settings").updateOne({ guild: updatedSetting.guild }, { $set: updatedSetting }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.clashOfClansSettings.clanTag = updatedSetting.clanTag;
        receivedMessage.guild.guildSettings.clashOfClansSettings.clanName = updatedSetting.clanName;
        receivedMessage.guild.guildSettings.clashOfClansSettings.cocReminderChannelId = updatedSetting.cocReminderChannelId;
        receivedMessage.guild.guildSettings.clashOfClansSettings.preparationEndWarning = updatedSetting.preparationEndWarning;
        receivedMessage.guild.guildSettings.clashOfClansSettings.preparationEndWarningMentions = updatedSetting.preparationEndWarningMentions;
        receivedMessage.guild.guildSettings.clashOfClansSettings.warEndWarning = updatedSetting.warEndWarning;
        receivedMessage.guild.guildSettings.clashOfClansSettings.warEndWarningMentions = updatedSetting.warEndWarningMentions;
        return receivedMessage.say(`Clash of Clans reminder settings were updated`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `coc-settings update`")
    }
}

async function deleteClashOfClansSettings(receivedMessage) {
    
}