const Commando = require("discord.js-commando");
const path = require("path");
const config = require("../../config.js");
const Discord = require("discord.js");
const permissionsSettingsSchema = require('../../schemas/permissionsSettingsSchema');

module.exports = class channelOverrideCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "channel-override",
      group: "permissions",
      memberName: "channel-override",
      description: "Allow or deny a specific command or category of commands to be run in the current channel.",
      examples: [],
      guildOnly: true,
      argsType: "multiple",
      userPermissions: ['ADMINISTRATOR']
    });
  }
  async run(receivedMessage, args) {

    if (!args || args.length < 2  ) {
        return receivedMessage.say('no args')
    } 
    else {
        const allowedOptions = ['allow', 'deny', 'delete']
        const option = args.splice(0,1)[0].toLowerCase()
        const commandNameOrGroup = args.join(' ')
        if (!allowedOptions.includes(option)){
            return receivedMessage.say('option incorrect')
        } 
        else {
            const channelOverrides = receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides
            if (this.client.registry.findCommands(commandNameOrGroup).length > 0){
                const commandName = this.client.registry.findCommands(commandNameOrGroup)[0].name
                const existsAllow = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'allow') && (override.command == commandName)))
                const existsDeny = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'deny') && (override.command == commandName)))
                if (option == 'allow'){
                    if (existsAllow[0]){
                        return receivedMessage.say('already allowed')
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.command == commandName) && (channelOverride.access == 'deny')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: commandName, commandGroup: null, channelId: receivedMessage.channel.id, access: 'allow' })
                    }
                }
                else if (option == 'deny'){
                    if (existsDeny[0]){
                        return receivedMessage.say('already denied')
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.command == commandName) && (channelOverride.access == 'allow')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: commandName, commandGroup: null, channelId: receivedMessage.channel.id, access: 'deny' })
                    }
                }
                else {
                    if (!existsAllow[0] && !existsDeny[0]){
                        return receivedMessage.say('no settings found to delete')
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.command == commandName)))
                    }
                    
                }
            }
            else if (this.client.registry.findGroups(commandNameOrGroup).length > 0){
                const commandGroupName = this.client.registry.findCommands(commandNameOrGroup)[0].name
                const existsAllow = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'allow') && (override.commandGroup == commandGroupName)))
                const existsDeny = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'deny') && (override.commandGroup == commandGroupName)))
                if (option == 'allow'){
                    if (existsAllow[0]){
                        return receivedMessage.say('already allowed')
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.commandGroup == commandGroupName) && (channelOverride.access == 'deny')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: null, commandGroup: commandGroupName, channelId: receivedMessage.channel.id, access: 'allow' })
                    }
                }
                else if (option == 'deny'){
                    if (existsDeny[0]){
                        return receivedMessage.say('already denied')
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.commandGroup == commandGroupName) && (channelOverride.access == 'allow')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: null, commandGroup: commandGroupName, channelId: receivedMessage.channel.id, access: 'deny' })
                    }
                }
                else {
                    if (!existsAllow[0] && !existsDeny[0]){
                        return receivedMessage.say('no settings found to delete')
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.commandGroup == commandGroupName)))
                    }
                    
                }
            }
            else {
                return receivedMessage.say('no command or category found')
            }
        }
    }
  }
};