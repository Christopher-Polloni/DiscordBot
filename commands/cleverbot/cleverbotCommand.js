const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class cleverbotCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'cleverbot',
            group: 'cleverbot',
            memberName: 'cleverbot',
            description: 'View or update the channel you can hold a conversation with the bot in.',
            examples: ['cleverbot', 'cleverbot update', 'cleverbot off'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            if (receivedMessage.guild.guildSettings.cleverbotSettings.enabled) {
                let cleverbotChannelId = receivedMessage.guild.guildSettings.cleverbotSettings.cleverbotChannelId;
                receivedMessage.say(`In ${receivedMessage.guild.name}, <@575416249400426506> will listen to all human messages in <#${cleverbotChannelId}> that aren't commands and will respond to them! Try holding a conversation and see what happens!`)
                receivedMessage.say(`To update these settings, use the command \`cleverbot update\`\nTo turn off this setting, use the command \`cleverbot off\``)
            }
            else {
                return receivedMessage.say(`The ability to hold a conversation with <@575416249400426506> in ${receivedMessage.guild.name} is not yet configured. Use the command \`cleverbot update\` to set the channel for this feature.`);
            }
        }
        else if (arg.toLowerCase() == 'update') {
            return getChannel(receivedMessage);
        }
        else if (arg.toLowerCase() == 'off') {
            return deleteCleverbotSetting(receivedMessage);
        }
        else {
            return receivedMessage.say(`To properly use this command, try \`cleverbot\`, \`cleverbot update\` or \`cleverbot off\``);
        }
    }
};

async function getChannel(receivedMessage) {
    receivedMessage.say(`Please enter the channel you'd like <@575416249400426506> to respond to messages in. Use the format <#${receivedMessage.channel.id}>.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {
                if (messages.first().mentions.channels.first()) {
                    const channelId = messages.first().mentions.channels.first().id;
                    return upsertCleverbotSetting(receivedMessage, channelId);
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

async function upsertCleverbotSetting(receivedMessage, channelId) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Cleverbot Settings").updateOne({ guild: receivedMessage.guild.id }, { $set: {channelId} }, { upsert: true });
        await client2.close();
        receivedMessage.guild.guildSettings.cleverbotSettings.enabled = true;
        receivedMessage.guild.guildSettings.cleverbotSettings.cleverbotChannelId = channelId;
        return receivedMessage.say(`Cleverbot settings updated! <@575416249400426506> will now interact with messages sent in <#${channelId}>`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `cleverbot update`")
    }
}

async function deleteCleverbotSetting(receivedMessage) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Cleverbot Settings").deleteOne({ guild: receivedMessage.guild.id });
        await client2.close();
        receivedMessage.guild.guildSettings.cleverbotSettings.enabled = false;
        receivedMessage.guild.guildSettings.cleverbotSettings.cleverbotChannelId = null;
        return receivedMessage.say(`Cleverbot settings are now turned off`);
    } catch (e) {
        console.error(e);
        return receivedMessage.say("There was an error updating the settings. You can restart the process with `cleverbot off`")
    }
}