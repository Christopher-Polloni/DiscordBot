const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')
const translationSettingsSchema = require('../../schemas/translationSettingsSchema');

module.exports = class autotranslationCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'auto-translate',
            group: 'translation',
            memberName: 'auto-translate',
            description: 'This feature allows all messages sent in a channel to be auto-translated to the language of your choice. The translated messages can be sent to any channel.',
            examples: ['auto-translate', 'auto-translate add', 'auto-translate remove'],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            let settings = ''
            for (let i=0; i< receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.length; i++) {
                const translateFromChannelId = receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings[i].translateFromChannelId
                const translateToChannelId = receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings[i].translateToChannelId
                const language = receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings[i].language
                settings = settings.concat(`**${i+1}.** <#${translateFromChannelId}> translated to ${language} in <#${translateToChannelId}>\n`)
            }
            const embed = new Discord.MessageEmbed()
                .setTitle('Auto-Translate Settings')
                .setColor('BLUE')
                .setDescription(`This feature allows all messages sent in a channel to be auto-translated to the language of your choice. The translated messages can be sent to any channel.\n\n${settings}`)
                .setFooter(`To add an auto-translate setting, use the command \`auto-translate add\`\nTo remove an existing setting, use the command \`auto-translate remove\``)
            return receivedMessage.say(embed)
        
        }
        else if (arg.toLowerCase() !== 'add' && arg.toLowerCase() !== 'remove') {
          return receivedMessage.say(`To properly use this command, try \`auto-translate\`, \`auto-translate add\`, or \`auto-translate remove\``);
        }
        else if (arg.toLowerCase() == 'add') {
            return getTranslateFromChannel(receivedMessage)
        }
        else {
            return selectSettingToRemove(receivedMessage)
        }
            
        }
      }

async function getTranslateFromChannel(receivedMessage) {
        receivedMessage.say(`Please enter the channel where all sent messages will be auto-translated (using the format <#${receivedMessage.channel.id}>).`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;
    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
        .then(messages => {
            if (messages.first().mentions.channels.first()) {
                const translateFromChannelId = messages.first().mentions.channels.first().id;
                return getTranslateToChannel(receivedMessage, translateFromChannelId);
            }
            else {
                receivedMessage.say("You didn't properly mention a channel.");
                return getTranslateFromChannel(receivedMessage);
                }
        })
        .catch((e) => {
            console.log(e)
            return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `auto-translate add`");
        });
    });
}

async function getTranslateToChannel(receivedMessage, translateFromChannelId) {
    receivedMessage.say(`Please enter the channel where all auto-translated messages from <#${translateFromChannelId}> will be sent to.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
        .then(messages => {
            if (messages.first().mentions.channels.first()) {
                const translateToChannelId = messages.first().mentions.channels.first().id;
                return getLanguage(receivedMessage, translateFromChannelId, translateToChannelId);
            }
            else {
                receivedMessage.say("You didn't properly mention a channel.");
                return getTranslateToChannel(receivedMessage, translateFromChannelId);
            }
        })
        .catch((e) => {
            console.log(e)
            return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `auto-translate add`");
        });
});
}

async function getLanguage(receivedMessage, translateFromChannelId, translateToChannelId) {
    let languageCodeOptions = ''
    for (let x in config.languages) {
        languageCodeOptions = languageCodeOptions.concat(`${config.languages[x].language} (${config.languages[x].abbreviation}), `)
    }
    receivedMessage.say(`Please enter the language code for the language you want all messages in <#${translateFromChannelId}> to be translated to in <#${translateToChannelId}>.\nSupported languages include ${languageCodeOptions.slice(0,-2)}.`).then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
        .then(messages => {
            let isValid = false
            let language = ''
            for (let x in config.languages) {
                if (config.languages[x].abbreviation == messages.first().content.toLowerCase()) {
                    isValid = true
                    language = config.languages[x].language
                }
            }
            if (isValid) {
                const languageCode = messages.first().content.toLowerCase();
                return addAutoTranslationSetting(receivedMessage, translateFromChannelId, translateToChannelId, languageCode, language)
            }
            else {
                receivedMessage.say("You didn't provide a supported language code.");
                return getLanguage(receivedMessage, translateFromChannelId, translateToChannelId);
            }
        })
        .catch((e) => {
            console.log(e)
            return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `auto-translate add`");
        });
});
}

async function addAutoTranslationSetting(receivedMessage, translateFromChannelId, translateToChannelId, languageCode, language) {
    let newSetting = { translateFromChannelId, translateToChannelId, languageCode, language}
    receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.push(newSetting)
    receivedMessage.guild.guildSettings.translationSettings.autoTranslateToggle = true
    try {
      result = await translationSettingsSchema.updateOne({ guildId: receivedMessage.guild.id }, { $set: { autoTranslateSettings: receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings }}, { upsert: true });
      return receivedMessage.say('Auto-translate setting successfully added!')
    }
    catch (error) {
      console.error(`Error updating auto-translation setting. Guild Id: ${receivedMessage.guild.id} ${newSetting}`, error)
      receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.pop
      if (receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.length == 0) { receivedMessage.guild.guildSettings.translationSettings.autoTranslateToggle = false }
      return receivedMessage.say('Something went wrong uploading your request. Please try again.')
    }
    
  }

async function selectSettingToRemove(receivedMessage) {
    let settings = ''
            for (let i=0; i< receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.length; i++) {
                const translateFromChannelId = receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings[i].translateFromChannelId
                const translateToChannelId = receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings[i].translateToChannelId
                const language = receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings[i].language
                settings = settings.concat(`**${i+1}.** <#${translateFromChannelId}> translated to ${language} in <#${translateToChannelId}>\n`)
            }
    const embed = new Discord.MessageEmbed()
        .setTitle('Auto-Translate Settings')
        .setColor('BLUE')
        .setDescription(`${settings}`)
    receivedMessage.say(embed)
    receivedMessage.say(`Please enter the number of the setting you'd like to remove.`).then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;  
    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
        .then(messages => {
            if (!isNaN(messages.first().content) && messages.first().content > 0 && messages.first().content <= receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.length) {
                return removeAutoTranslationSetting(receivedMessage, messages.first().content-1)
            }
            else {
                receivedMessage.say('A valid number was not provided.')
               return selectSettingToRemove(receivedMessage)
            }
        })
        .catch((e) => {
            console.log(e)
            return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `auto-translate remove`");
        });
    });
}

async function removeAutoTranslationSetting(receivedMessage, arrayPosition) {
    const removedSetting = receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.splice(arrayPosition,1)
    if (receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.length == 0) { receivedMessage.guild.guildSettings.translationSettings.autoTranslateToggle = false }
    try {
        result = await translationSettingsSchema.updateOne({ guildId: receivedMessage.guild.id }, { $set: { autoTranslateSettings: receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings }}, { upsert: true });
        return receivedMessage.say(`Succesfully removed setting to translate messages from <#${removedSetting[0].translateFromChannelId}> to ${removedSetting[0].language} in <#${removedSetting[0].translateToChannelId}>.`)
    }
    catch (error) {
      console.error(`Error removing auto-translation setting. Guild Id: ${receivedMessage.guild.id}`, error)
      receivedMessage.guild.guildSettings.translationSettings.autoTranslateSettings.splice(arrayPosition,1, removedSetting)
      receivedMessage.guild.guildSettings.translationSettings.autoTranslateToggle = false
      return receivedMessage.say('Something went wrong removing the setting. Please try again.')
    }
    
  }