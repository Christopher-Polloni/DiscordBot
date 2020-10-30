const Commando = require('discord.js-commando');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))

module.exports = class welcomeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'welcome',
      group: 'moderation',
      memberName: 'welcome',
      description: '',
      examples: [''],
      guildOnly: true,
      argsType: 'single',
      userPermissions: ['ADMINISTRATOR']
    })
  }
  async run(receivedMessage, arg) {
    
  }
};

