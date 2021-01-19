const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const Discord = require('discord.js');

module.exports = class messageDeleteLogCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'message-delete-log',
            aliases: ['messagedeletelog'],
            group: 'moderation logs',
            memberName: 'message-delete-log',
            description: 'Set a channel for a message to be sent in when a message is deleted in the server (not bot messages).',
            examples: ['message-delete-log', 'message-delete-log update', 'message-delete-log off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogChannelId) {
                const embed = new Discord.MessageEmbed()
                    .setTitle('Moderation Log Settings - Message Deletion')
                    .setColor('BLUE')
                    .addField('Log Channel:', `<#${receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogChannelId}>`)
                    .setFooter(`To update these settings, use the command \`message-delete-log update\`\nTo completely disable these settings, use the command \`message-delete-log off\``)
                if (receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.length > 0){
                    embed.addField('Ignore Deleted Messages Starting With:', receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith)
                }
                else {
                    embed.addField('Ignore Deleted Messages Starting With:', '\u200B')
                }
                if (receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.length > 0){
                    embed.addField('Ignore Deleted Messages That Include:', receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes)
                }
                else {
                    embed.addField('Ignore Deleted Messages That Include:', '\u200B')
                }
                return receivedMessage.say(embed)
            }
            else {
                return receivedMessage.say(`A channel for a message to be sent in when a message is deleted in ${receivedMessage.guild.name} is not set.\nTo update these settings, use the command \`message-delete-log update\``);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getUpdateOption(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteMessageDeleteLogSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`message-delete-log\`, \`message-delete-log update\` or \`message-delete-log off\``);
        }
    }
};

async function getUpdateOption(receivedMessage) {
    receivedMessage.say(`Respond with:\n\`channel\` - to update the channel messages are logged in when they are deleted.\n\`starts with\` - to update what messages will not be logged if they start with the phrase you enter.\n\`includes\` - to update what messages will not be logged if they include, anywhere in the message, the phrase you enter.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                if (messages.first().content.toLowerCase() == 'channel') {
                    return getChannel(receivedMessage)
                }
                else if (messages.first().content.toLowerCase() == 'starts with') {
                    return getAddOrRemove(receivedMessage, 'starts with')
                }
                else if (messages.first().content.toLowerCase() == 'includes') {
                    return getAddOrRemove(receivedMessage, 'includes')
                }
                else {
                    receivedMessage.say("You didn't select a proper option.");
                    return getUpdateOption(receivedMessage);
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-delete-log update`");
            });
    });
}

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel for a message to be sent in when a message is deleted in ${receivedMessage.guild.name} (using the format <#${receivedMessage.channel.id}>).`).then((newmsg) => {
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
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-delete-log update`");
            });
    });
}

async function getAddOrRemove(receivedMessage, option) {
    receivedMessage.say(`Respond with\n\`add\` or \`remove\` to select whether you'd like to add a phrase to the ignore list or remove one.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                if (messages.first().content.toLowerCase() == 'add' && option == 'starts with') {
                    return addStartsWith(receivedMessage)
                }
                else if (messages.first().content.toLowerCase() == 'remove' && option == 'starts with') {
                    return removeStartsWith(receivedMessage)
                }
                else if (messages.first().content.toLowerCase() == 'add' && option == 'includes') {
                    return addIncludes(receivedMessage)
                }
                else if (messages.first().content.toLowerCase() == 'remove' && option == 'includes') {
                    return removeIncludes(receivedMessage)
                }
                else {
                    receivedMessage.say("You didn't properly select an option.");
                    return getAddOrRemove(receivedMessage, option);
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-delete-log update`");
            });
    });
}

async function addStartsWith(receivedMessage) {
    receivedMessage.say(`Type the phrase you'd like to add to the list. If a message that is deleted starts with this phrase, it will not be logged. Type \`cancel\` to cancel`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(async (messages) => {
                if (messages.first().content.toLowerCase() == 'cancel') {
                    return
                }
                if (receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.includes(messages.first().content)) {
                    return receivedMessage.say("That phrase is already in the ignore list. If a message that is deleted starts with that phrase it won't be logged")
                }
                try {
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.unshift(messages.first().content)
                    await client2.connect();
                    result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageDeleteLogIgnoreStartsWith: receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith } }, { upsert: true });
                    await client2.close();
                    receivedMessage.say(`That phrase has been added to the ignore list.`);
                    return addStartsWith(receivedMessage)
                } catch (e) {
                    console.error(e);
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.shift()
                    return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-delete-log update`")
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-delete-log update`");
            });
    });
}

async function addIncludes(receivedMessage) {
    receivedMessage.say(`Type the phrase you'd like to add to the list. If a message that is deleted includes this phrase, it will not be logged. Type \`cancel\` to cancel`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(async (messages) => {
                if (messages.first().content.toLowerCase() == 'cancel') {
                    return
                }
                if (receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.includes(messages.first().content)) {
                    return receivedMessage.say("That phrase is already in the ignore list. If a message that is deleted includes that phrase it won't be logged")
                }
                try {
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.unshift(messages.first().content)
                    await client2.connect();
                    result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageDeleteLogIgnoreIncludes: receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes } }, { upsert: true });
                    await client2.close();
                    receivedMessage.say(`That phrase has been added to the ignore list.`);
                    return addStartsWith(receivedMessage)
                } catch (e) {
                    console.error(e);
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.shift()
                    return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-delete-log update`")
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-delete-log update`");
            });
    });
}

async function removeStartsWith(receivedMessage) {
    receivedMessage.say(`Type the phrase you'd like to remove from the list. If a message that is deleted starts with this phrase, it will now be logged. Type \`cancel\` to cancel`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(async (messages) => {
                if (messages.first().content.toLowerCase() == 'cancel') {
                    return
                }
                if (!receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.includes(messages.first().content)) {
                    return receivedMessage.say("That phrase is not in the ignore list. To view a list of phrases that are set to be ignored, run the `message-delete-log` command")
                }
                try {
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.splice(receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.indexOf(messages.first().content), receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.indexOf(messages.first().content) + 1)
                    await client2.connect();
                    result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageDeleteLogIgnoreStartsWith: receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith } }, { upsert: true });
                    await client2.close();
                    receivedMessage.say("That phrase has been removed from the ignore list. To view a list of phrases that are set to be ignored, run the `message-delete-log` command");
                    return removeStartsWith(receivedMessage)
                } catch (e) {
                    console.error(e);
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreStartsWith.unshift(messages.first().content)
                    return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-delete-log update`")
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-delete-log update`");
            });
    });
}

async function removeIncludes(receivedMessage) {
    receivedMessage.say(`Type the phrase you'd like to remove from the list. If a message that is deleted includes this phrase, it will now be logged. Type \`cancel\` to cancel`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(async (messages) => {
                if (messages.first().content.toLowerCase() == 'cancel') {
                    return
                }
                if (!receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.includes(messages.first().content)) {
                    return receivedMessage.say("That phrase is not in the ignore list. To view a list of phrases that are set to be ignored, run the `message-delete-log` command")
                }
                try {
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.splice(receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.indexOf(messages.first().content), receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.indexOf(messages.first().content) + 1)
                    await client2.connect();
                    result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageDeleteLogIgnoreIncludes: receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes } }, { upsert: true });
                    await client2.close();
                    receivedMessage.say("That phrase has been removed from the ignore list. To view a list of phrases that are set to be ignored, run the `message-delete-log` command");
                    return removeIncludes(receivedMessage)
                } catch (e) {
                    console.error(e);
                    receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogIgnoreIncludes.unshift(messages.first().content)
                    return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-delete-log update`")
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `message-delete-log update`");
            });
    });
}

async function upsertModerationLogSetting(receivedMessage, channelId) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageDeleteLogChannelId: channelId } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogChannelId = channelId;
        return receivedMessage.say(`Moderation Log Settings were updated for message deletion.`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-delete-log update`")
    }
}

async function deleteMessageDeleteLogSetting(receivedMessage) {
    if (!receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogChannelId) {
        return receivedMessage.say(`Moderation Log Setting for message deletion was already turned off`);
    }
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Moderation Log Settings").updateOne({ guildId: receivedMessage.guild.id }, { $set: { guildId: receivedMessage.guild.id, messageDeleteLogChannelId: null } }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.moderationLogs.messageDeleteLogChannelId = null;
        return receivedMessage.say(`Moderation Log Setting for message deletion is now turned off`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `message-delete-log off`")
    }
}