const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class translationReactionToggleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'toggletranslation',
      group: 'translation',
      memberName: 'toggletranslation',
      description: 'Toggle whether translation occurs in a server when reacting to a message with specific country flags. Only server owners can use this command.',
      examples: ['toggletranslation', 'toggletranslation on', 'toggletranslation off'],
      guildOnly: true,
      argsType: 'single',
      userPermissions: ['ADMINISTRATOR']
    })
  }
  async run(receivedMessage, arg) {
    if (!arg) {
      if (receivedMessage.guild.guildSettings.reactionTranslator == true) {
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
        if (arg.toLowerCase() == 'on' && receivedMessage.guild.guildSettings.reactionTranslator) {
          return receivedMessage.say(`The ability to translate messages using reactions is already enabled!`);
        }
        else if (arg.toLowerCase() == 'on' && !receivedMessage.guild.guildSettings.reactionTranslator) {
          await upsertTranslatorSetting(receivedMessage.guild.id, { reactionTranslator: true });
          receivedMessage.guild.guildSettings.reactionTranslator = true;
          return receivedMessage.say(`The ability to translate messages using reactions is now enabled!`);
        }
        else if (arg.toLowerCase() == 'off' && receivedMessage.guild.guildSettings.reactionTranslator) {
          await upsertTranslatorSetting(receivedMessage.guild.id, { reactionTranslator: false });
          receivedMessage.guild.guildSettings.reactionTranslator = false;
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
  const MongoClient = require('mongodb').MongoClient;
  const uri = config.mongoUri;
  const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client2.connect();
  result = await client2.db("DiscordBot").collection("Translator Settings").updateOne({ guild: guildId }, { $set: updatedSetting }, { upsert: true });
  await client2.close();
  return
}
