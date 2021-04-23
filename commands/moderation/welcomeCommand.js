const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const serverWelcomeSettingsSchema = require ('../../schemas/serverWelcomeSettingsSchema')

module.exports = class welcomeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'welcome',
            group: 'moderation',
            memberName: 'welcome',
            description: 'View or update your welcome message for members joining your server.',
            examples: ['welcome', 'welcome update', 'welcome off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.welcomeSettings.welcomeChannelId) {
                let welcomeChannelId = receivedMessage.guild.guildSettings.welcomeSettings.welcomeChannelId;
                let welcomeMessage = receivedMessage.guild.guildSettings.welcomeSettings.welcomeMessage;
                receivedMessage.say(`${receivedMessage.guild.name} welcome messages are set to be sent in <#${welcomeChannelId}> with the following message:`)
                receivedMessage.say(`${welcomeMessage}`)
                receivedMessage.say(`To update these settings, use the command \`welcome update\`\nTo turn off this setting, use the command \`welcome off\``)
            }
            else {
                return receivedMessage.say(`Welcome message settings for ${receivedMessage.guild.name} are not set.`);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getChannel(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteWelcomeSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`welcome\`, \`welcome update\` or \`welcome off\``);
        }
    }
};

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel for ${receivedMessage.guild.name} server's welcome messages to be sent in using the format <#${receivedMessage.channel.id}>.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                if (messages.first().mentions.channels.first()) {
                    const channelId = messages.first().mentions.channels.first().id;
                    return getWelcomeMessage(receivedMessage, channelId);
                }
                else {
                    receivedMessage.say("You didn't properly mention a channel.");
                    return getChannel(receivedMessage);
                }
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `welcome update`");
            });
    });
}

async function getWelcomeMessage(receivedMessage, channelId) {
    receivedMessage.say(`Please enter the message you'd like new members to see when they join ${receivedMessage.guild.name}\nTo mention a member in your message, use the placeholder \`---\``).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                const message = messages.first().content;
                const updatedSetting = {
                    welcomeChannelId: channelId,
                    welcomeMessage: message,
                    guildId: receivedMessage.guild.id
                }
                return upsertWelcomeSetting(receivedMessage, updatedSetting);
            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `welcome update`");
            });
    });
}

async function upsertWelcomeSetting(receivedMessage, updatedSetting) {
    try {
        result = await serverWelcomeSettingsSchema.updateOne({ guildId: updatedSetting.guild }, { $set: updatedSetting }, { upsert: true });
        receivedMessage.guild.guildSettings.welcomeSettings.welcomeChannelId = updatedSetting.welcomeChannelId;
        receivedMessage.guild.guildSettings.welcomeSettings.welcomeMessage = updatedSetting.welcomeMessage;
        return receivedMessage.say(`Welcome settings were updated`);
    } catch (e) {
        console.error(`Error updating welcome message. Guild: ${receivedMessage.guild.id}\n`, e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `welcome update`")
    }
}

async function deleteWelcomeSetting(receivedMessage) {
    try {
        result = await serverWelcomeSettingsSchema.deleteOne({ guild: receivedMessage.guild.id });
        receivedMessage.guild.guildSettings.welcomeSettings.welcomeChannelId = null;
        receivedMessage.guild.guildSettings.welcomeSettings.welcomeMessage = null;
        return receivedMessage.say(`Welcome settings are now turned off`);
    } catch (e) {
        console.error(`Error deleting welcome message. Guild: ${receivedMessage.guild.id}\n`, e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `welcome off`")
    }
}