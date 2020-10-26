const Commando = require('discord.js-commando');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))

module.exports = class translationReactionToggleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'toggletranslation',
      group: 'translation',
      memberName: 'toggletranslation',
      description: 'Toggle whether translation occurs in a server when reacting to a message with specific country flags. Only server owners can use this command.',
      examples: ['$toggletranslation on', '$toggletranslation off'],
      guildOnly: true,
      argsType: 'single'
    })
  }
  async run(receivedMessage, arg) {
    if (arg == 'on' && receivedMessage.guild.translatorData.reactionTranslator == true) {
      return receivedMessage.say(`The ability to translate messages using reactions is already enabled!`);
    }
    else if (arg == 'on' && receivedMessage.guild.translatorData.reactionTranslator == false) {
      receivedMessage.guild.translatorData.reactionTranslator = true;
      return receivedMessage.say(`The ability to translate messages using reactions is now enabled!`);
    }
    else if (arg == 'off' && receivedMessage.guild.translatorData.reactionTranslator == true) {
      receivedMessage.guild.translatorData.reactionTranslator = false;
      return receivedMessage.say(`The ability to translate messages using reactions is now disabled!`);
    }
    else if (arg == 'off' && receivedMessage.guild.translatorData.reactionTranslator == false) {
      return receivedMessage.say(`The ability to translate messages using reactions is already disabled!`);
    }
    else {
      if (receivedMessage.guild.translatorData.reactionTranslator == true){
        return receivedMessage.say(`The ability to translate messages using reactions is currently enabled!`);
      }
      else {
        return receivedMessage.say(`The ability to translate messages using reactions is currently disabled!`);
      }
    }
  }
};
