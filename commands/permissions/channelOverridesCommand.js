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
      examples: ['channel-override enable <command/category>', 'channel-override disable <command/category>', 'channel-override delete <command/category>'],
      guildOnly: true,
      argsType: "multiple",
      userPermissions: ['ADMINISTRATOR']
    });
  }
  async run(receivedMessage, args) {

    if (!args || args.length < 2  ) {
        const embed = new Discord.MessageEmbed()
            .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            .setColor('YELLOW')
            .setDescription(`The proper information was not provided.\nExamples of how to use the command:\n\`channel-override enable <command/category>\`\n\`channel-override disable <command/category>\`\n\`channel-override delete <command/category>\``)
        return receivedMessage.say(embed)
    } 
    else {
        const allowedOptions = ['enable', 'disable', 'delete']
        const option = args.splice(0,1)[0].toLowerCase()
        const commandNameOrGroup = args.join(' ')
        if (!allowedOptions.includes(option)){
            const embed = new Discord.MessageEmbed()
                .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                .setColor('YELLOW')
                .setDescription(`The proper information was not provided.\nExamples of how to use the command:\n\`channel-override enable <command/category>\`\n\`channel-override disable <command/category>\`\n\`channel-override delete <command/category>\``)
            return receivedMessage.say(embed)
        } 
        else {
            const allowEmbed = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            const denyEmbed = new Discord.MessageEmbed()
                .setColor('RED')
                .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            const deleteEmbed = new Discord.MessageEmbed()
                .setColor('YELLOW')
                .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            const channelOverrides = receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides
            if (this.client.registry.findCommands(commandNameOrGroup).length > 0){
                const commandName = this.client.registry.findCommands(commandNameOrGroup)[0].name
                const existsAllow = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'allow') && (override.command == commandName)))
                const existsDeny = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'deny') && (override.command == commandName)))
                if (option == 'enable'){
                    if (existsAllow[0]){
                        allowEmbed.setDescription(`<:check_mark:845062687649562625> The \`${commandName}\` command is already enabled in <#${receivedMessage.channel.id}>.`)
                        return receivedMessage.say(allowEmbed)
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.command == commandName) && (channelOverride.access == 'deny')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: commandName, commandGroup: null, channelId: receivedMessage.channel.id, access: 'allow' })
                        allowEmbed.setDescription(`<:check_mark:845062687649562625> The \`${commandName}\` command is now enabled in <#${receivedMessage.channel.id}>.`)
                        await updateChannelOverridesDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides)                        
                        return receivedMessage.say(allowEmbed)
                    }
                }
                else if (option == 'disable'){
                    if (existsDeny[0]){
                        denyEmbed.setDescription(`<:x_mark:845062220467142658> The \`${commandName}\` command is already disabled in <#${receivedMessage.channel.id}>.`)
                        return receivedMessage.say(denyEmbed)
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.command == commandName) && (channelOverride.access == 'allow')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: commandName, commandGroup: null, channelId: receivedMessage.channel.id, access: 'deny' })
                        denyEmbed.setDescription(`<:x_mark:845062220467142658> The \`${commandName}\` command is now disabled in <#${receivedMessage.channel.id}>.`)
                        await updateChannelOverridesDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides)
                        return receivedMessage.say(denyEmbed)
                    }
                }
                else {
                    if (!existsAllow[0] && !existsDeny[0]){
                        deleteEmbed.setDescription(`No settings for the \`${commandName}\` command in <#${receivedMessage.channel.id}> were found to delete.`)
                        return receivedMessage.say(deleteEmbed)
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.command == commandName)))
                        deleteEmbed.setDescription(`Settings for the \`${commandName}\` command in <#${receivedMessage.channel.id}> have been deleted.`)
                        await updateChannelOverridesDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides)
                        return receivedMessage.say(deleteEmbed)
                    }
                    
                }
            }
            else if (this.client.registry.findGroups(commandNameOrGroup).length > 0){
                const commandGroupName = this.client.registry.findGroups(commandNameOrGroup)[0].name
                const existsAllow = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'allow') && (override.commandGroup == commandGroupName)))
                const existsDeny = channelOverrides.filter(override => ((override.channelId == receivedMessage.channel.id) && (override.access == 'deny') && (override.commandGroup == commandGroupName)))
                if (option == 'enable'){
                    if (existsAllow[0]){
                        allowEmbed.setDescription(`<:check_mark:845062687649562625> The \`${commandGroupName}\` category is already enabled in <#${receivedMessage.channel.id}>.`)
                        return receivedMessage.say(allowEmbed)
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.commandGroup == commandGroupName) && (channelOverride.access == 'deny')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: null, commandGroup: commandGroupName, channelId: receivedMessage.channel.id, access: 'allow' })
                        allowEmbed.setDescription(`<:check_mark:845062687649562625> The \`${commandGroupName}\` category is now enabled in <#${receivedMessage.channel.id}>.`)
                        await updateChannelOverridesDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides)
                        return receivedMessage.say(allowEmbed)
                    }
                }
                else if (option == 'disable'){
                    if (existsDeny[0]){
                        denyEmbed.setDescription(`<:x_mark:845062220467142658> The \`${commandGroupName}\` category is already disabled in <#${receivedMessage.channel.id}>.`)
                        return receivedMessage.say(denyEmbed)
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.commandGroup == commandGroupName) && (channelOverride.access == 'allow')))
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides.push({command: null, commandGroup: commandGroupName, channelId: receivedMessage.channel.id, access: 'deny' })
                        denyEmbed.setDescription(`<:x_mark:845062220467142658> The \`${commandGroupName}\` category is now disabled in <#${receivedMessage.channel.id}>.`)
                        await updateChannelOverridesDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides)
                        return receivedMessage.say(denyEmbed)
                    }
                }
                else {
                    if (!existsAllow[0] && !existsDeny[0]){
                        deleteEmbed.setDescription(`No settings for the \`${commandGroupName}\` category in <#${receivedMessage.channel.id}> were found to delete.`)
                        return receivedMessage.say(deleteEmbed)
                    }
                    else {
                        receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides = channelOverrides.filter(channelOverride => !((channelOverride.channelId == receivedMessage.channel.id) && (channelOverride.commandGroup == commandGroupName)))
                        deleteEmbed.setDescription(`Settings for the \`${commandGroupName}\` category in <#${receivedMessage.channel.id}> have been deleted.`)
                        await updateChannelOverridesDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.channelOverrides)
                        return receivedMessage.say(deleteEmbed)
                    }
                    
                }
            }
            else {
                const embed = new Discord.MessageEmbed()
                    .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                    .setColor('YELLOW')
                    .setDescription(`Did not recognize a command or category with the name \`${commandNameOrGroup}\`.\nTo view a list of all commands and categories, use the \`help\` command.`)
                return receivedMessage.say(embed)
            }
        }
    }
  }
};

async function updateChannelOverridesDB(guildId, channelOverrides) {
    
    result = await permissionsSettingsSchema.updateOne({ guildId: guildId }, { $set: { channelOverrides: channelOverrides} }, { upsert: true });
    
  }
