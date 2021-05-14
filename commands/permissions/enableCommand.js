const Commando = require("discord.js-commando");
const path = require("path");
const config = require("../../config.js");
const Discord = require("discord.js");
const permissionsSettingsSchema = require('../../schemas/permissionsSettingsSchema');

module.exports = class enableCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "enable",
      group: "permissions",
      memberName: "enable",
      description: "Enable a command or category throughout an entire server. ",
      examples: [],
      guildOnly: true,
      argsType: "single",
      userPermissions: ['ADMINISTRATOR']
    });
  }
  async run(receivedMessage, arg) {

    if (arg) {
      if (this.client.registry.findCommands(arg).length > 0) {
        const command = this.client.registry.findCommands(arg)[0]
        if (receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands.includes(command.name)) {
            return receivedMessage.say(`The command \`${command.name}\` is already enabled throughout the server.`)
        }
        else if (receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.includes(command.name)) {
            receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands = receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.filter(commands => commands !== command.name)
            receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands.push(command.name)
            return receivedMessage.say(`The command \`${command.name}\` is now enabled throughout the server.`)
        }
        else {
            receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands.push(command.name)
            return receivedMessage.say(`The command \`${command.name}\` is now enabled throughout the server.`)
        }
      }
      else if (this.client.registry.findGroups(arg).length > 0) {
        const group = this.client.registry.findGroups(arg)[0];
        if (receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups.includes(group.name)) {
            receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups = receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups.filter(groups => groups !== group.name)
            return receivedMessage.say(`The \`${group.name}\` category is now enabled throughout the server.`)
        }
        else {
          return receivedMessage.say(`The \`${group.name}\` category is already enabled throughout the server.`)
        }
      }
      else {
        return receivedMessage.say(`Did not recognize a command or category with the name \`${arg}\`. To view a list of all commands and categories, use the \`help\` command.`)
      }  
    } 
    else {
      
    }
  }
};
