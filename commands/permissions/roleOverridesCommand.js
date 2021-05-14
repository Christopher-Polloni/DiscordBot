const Commando = require("discord.js-commando");
const path = require("path");
const config = require("../../config.js");
const Discord = require("discord.js");
const permissionsSettingsSchema = require('../../schemas/permissionsSettingsSchema');

module.exports = class roleOverridesCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "role-override",
      group: "permissions",
      memberName: "role-override",
      description: "",
      examples: [],
      guildOnly: true,
      argsType: "multiple",
      userPermissions: ['ADMINISTRATOR']
    });
  }
  async run(receivedMessage, args) {

    if (args.length < 3 && args[0].toLowerCase() !== 'clear' ) {
        return receivedMessage.say('no args')
    } 
    else {
        const allowedOptions = ['allow', 'deny', 'delete']
        const option = args.splice(0,1)[0].toLowerCase()
        let role
        if (receivedMessage.mentions.roles.first()) {
            role = receivedMessage.mentions.roles.first()
        }
        else {
            role = await receivedMessage.guild.roles.fetch(args[0])
        }
        args.splice(0,1)
        const commandNameOrGroup = args.join(' ')

        if (!allowedOptions.includes(option)){
            return receivedMessage.say('option incorrect')
        } 
        else {
            if (!role) {
                return receivedMessage.say('no role')
            }
            else {
                const roleOverrides = receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides
                if (this.client.registry.findCommands(commandNameOrGroup).length > 0){
                    const commandName = this.client.registry.findCommands(commandNameOrGroup)[0].name
                    const existsAllow = roleOverrides.filter(roleOverride => ((roleOverride.roleId == role.id) && (roleOverride.access == 'allow') && (roleOverride.command == commandName)))
                    const existsDeny = roleOverrides.filter(roleOverride => ((roleOverride.roleId == role.id) && (roleOverride.access == 'deny') && (roleOverride.command == commandName)))
                    if (option == 'allow'){
                        if (existsAllow[0]){
                            return receivedMessage.say('already allowed')
                        }
                        else {
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides = roleOverrides.filter(roleOverride => !((roleOverride.roleId == role.id) && (roleOverride.command == commandName) && (roleOverride.access == 'deny')))
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides.push({command: commandName, commandGroup: null, roleId: role.id, access: 'allow' })
                        }
                    }
                    else if (option == 'deny'){
                        if (existsDeny[0]){
                            return receivedMessage.say('already denied')
                        }
                        else {
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides = roleOverrides.filter(roleOverride => !((roleOverride.roleId == role.id) && (roleOverride.command == commandName) && (roleOverride.access == 'allow')))
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides.push({command: commandName, commandGroup: null, roleId: role.id, access: 'deny' })
                        }
                    }
                    else {
                        if (!existsAllow[0] && !existsDeny[0]){
                            return receivedMessage.say('no settings found to delete')
                        }
                        else {
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides = roleOverrides.filter(roleOverride => !((roleOverride.roleId == role.id) && (roleOverride.command == commandName)))
                        }
                        
                    }
                }
                else if (this.client.registry.findGroups(commandNameOrGroup).length > 0){
                    const commandGroupName = this.client.registry.findCommands(commandNameOrGroup)[0].name
                    const existsAllow = roleOverrides.filter(override => ((override.roleId == role.id) && (override.access == 'allow') && (override.commandGroup == commandGroupName)))
                    const existsDeny = roleOverrides.filter(override => ((override.roleId == role.id) && (override.access == 'deny') && (override.commandGroup == commandGroupName)))
                    if (option == 'allow'){
                        if (existsAllow[0]){
                            return receivedMessage.say('already allowed')
                        }
                        else {
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides = roleOverrides.filter(roleOverride => !((roleOverride.roleId == role.id) && (roleOverride.commandGroup == commandGroupName) && (roleOverride.access == 'deny')))
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides.push({command: null, commandGroup: commandGroupName, roleId: role.id, access: 'allow' })
                        }
                    }
                    else if (option == 'deny'){
                        if (existsDeny[0]){
                            return receivedMessage.say('already denied')
                        }
                        else {
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides = roleOverrides.filter(roleOverride => !((roleOverride.roleId == role.id) && (roleOverride.commandGroup == commandGroupName) && (roleOverride.access == 'allow')))
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides.push({command: null, commandGroup: commandGroupName, roleId: role.id, access: 'deny' })
                        }
                    }
                    else {
                        if (!existsAllow[0] && !existsDeny[0]){
                            return receivedMessage.say('no settings found to delete')
                        }
                        else {
                            receivedMessage.guild.guildSettings.permissionsSettings.roleOverrides = roleOverrides.filter(roleOverride => !((roleOverride.roleId == role.id) && (roleOverride.commandGroup == commandGroupName)))
                        }
                        
                    }
                }
                else {
                    return receivedMessage.say('no command or category found')
                }
                }
            
        }
    }
  }
};