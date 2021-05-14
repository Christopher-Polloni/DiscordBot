const Commando = require("discord.js-commando");
const path = require("path");
const config = require("../../config.js");
const Discord = require("discord.js");
const permissionsSettingsSchema = require('../../schemas/permissionsSettingsSchema');

module.exports = class disableCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "disable",
      group: "permissions",
      memberName: "disable",
      description: "Disable a command or category throughout an entire server.",
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
        if (receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.includes(command.name)) {
          return receivedMessage.say(`The command \`${command.name}\` is already disabled throughout the server.`)
        }
        else if (receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands.includes(command.name)) {
          receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands = receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands.filter(commands => commands !== command.name)
          receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.push(command.name)
          return receivedMessage.say(`The command \`${command.name}\` is now disabled throughout the server.`)
      }
        else {
          receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.push(command.name)
          return receivedMessage.say(`The command \`${command.name}\` is now disabled throughout the server.`)
        }
        
      }
      else if (this.client.registry.findGroups(arg).length > 0) {
        const group = this.client.registry.findGroups(arg)[0];
        if (receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups.includes(group.name)) {
          return receivedMessage.say(`The \`${group.name}\` category is already disabled throughout the server.`)
        }
        else {
          receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups.push(group.name)
          return receivedMessage.say(`The \`${group.name}\` category is now disabled throughout the server.`)
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