const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const translationSettingsSchema = require('../../schemas/translationSettingsSchema');

module.exports = class translationReactionToggleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'toggle-translation',
      group: 'translation',
      memberName: 'toggle-translation',
      description: 'Toggle whether translation occurs in a server when reacting to a message with specific country flags.',
      examples: ['toggle-translation', 'toggle-translation on', 'toggle-translation off'],
      guildOnly: true,
      argsType: 'single',
      userPermissions: ['MANAGE_GUILD']
    })
  }
  async run(receivedMessage, arg) {
    if (!arg) {
      if (receivedMessage.guild.guildSettings.translationSettings.reactionTranslator == true) {
        return receivedMessage.say(`The ability to translate messages using reactions is currently enabled!`);
      }
      else {
        return receivedMessage.say(`The ability to translate messages using reactions is currently disabled!`);
      }
    }
    else if (arg.toLowerCase() !== 'on' && arg.toLowerCase() !== 'off') {
      return receivedMessage.say(`To properly use this command, try \`toggletranslation\`, \`toggletranslation on\`, or \`toggletranslation off\``);
    }
    else {
      try {
        if (arg.toLowerCase() == 'on' && receivedMessage.guild.guildSettings.translationSettings.reactionTranslator) {
          return receivedMessage.say(`The ability to translate messages using reactions is already enabled!`);
        }
        else if (arg.toLowerCase() == 'on' && !receivedMessage.guild.guildSettings.translationSettings.reactionTranslator) {
          await upsertTranslatorSetting(receivedMessage.guild.id, { reactionTranslator: true });
          receivedMessage.guild.guildSettings.translationSettings.reactionTranslator = true;
          return receivedMessage.say(`The ability to translate messages using reactions is now enabled!`);
        }
        else if (arg.toLowerCase() == 'off' && receivedMessage.guild.guildSettings.translationSettings.reactionTranslator) {
          await upsertTranslatorSetting(receivedMessage.guild.id, { reactionTranslator: false });
          receivedMessage.guild.guildSettings.translationSettings.reactionTranslator = false;
          return receivedMessage.say(`The ability to translate messages using reactions is now disabled!`);
        }
        else {
          return receivedMessage.say(`The ability to translate messages using reactions is already disabled!`);
        }
      }
      catch (e) {
        console.error(e);
        return receivedMessage.say(`There was an error updating your server's translation settings. Please try again.`)
      }
    }
  }
};


async function upsertTranslatorSetting(guildId, updatedSetting) {
  try {
    result = await translationSettingsSchema.updateOne({ guildId: guildId }, { $set: updatedSetting }, { upsert: true });
  }
  catch (error) {
    console.error(`Error updating translation setting. Guild Id: ${guildId} ${updatedSetting}`, error)
  }
  
}
