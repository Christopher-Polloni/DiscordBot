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
      examples: ['disable <command>', 'disable <command category>'],
      guildOnly: true,
      argsType: "single",
      userPermissions: ['ADMINISTRATOR']
    });
  }
  async run(receivedMessage, arg) {

    const embed = new Discord.MessageEmbed()
      .setColor('RED')
      .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())

    if (arg) {
      if (this.client.registry.findCommands(arg).length > 0) {
        const command = this.client.registry.findCommands(arg)[0]
        if (receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.includes(command.name)) {
          embed.setDescription(`<:x_mark:845062220467142658> The command \`${command.name}\` is already disabled throughout the server.`)
          return receivedMessage.say(embed)
        }
        else if (receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands.includes(command.name)) {
          receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands = receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands.filter(commands => commands !== command.name)
          receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.push(command.name)
          embed.setDescription(`<:x_mark:845062220467142658> The command \`${command.name}\` is now disabled throughout the server.`)
          await updateEnabledCommandsDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.enabledCommands)
          await updateDisabledCommandsDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands)
          return receivedMessage.say(embed)
      }
        else {
          receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands.push(command.name)
          embed.setDescription(`<:x_mark:845062220467142658> The command \`${command.name}\` is now disabled throughout the server.`)
          await updateDisabledCommandsDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.disabledCommands)
          return receivedMessage.say(embed)
        }
        
      }
      else if (this.client.registry.findGroups(arg).length > 0) {
        const group = this.client.registry.findGroups(arg)[0];
        if (receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups.includes(group.name)) {
          embed.setDescription(`<:x_mark:845062220467142658> The \`${group.name}\` category is already disabled throughout the server.`)
          return receivedMessage.say(embed)
        }
        else {
          receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups.push(group.name)
          embed.setDescription(`<:x_mark:845062220467142658> The \`${group.name}\` category is now disabled throughout the server.`)
          await updateDisabledCommandGroupsDB(receivedMessage.guild.id, receivedMessage.guild.guildSettings.permissionsSettings.disabledCommandGroups)
          return receivedMessage.say(embed)
        }
      }
      else {
        const embed = new Discord.MessageEmbed()
          .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
          .setColor('YELLOW')
          .setDescription(`Did not recognize a command or category with the name \`${arg}\`.\nTo view a list of all commands and categories, use the \`help\` command.`)
        return receivedMessage.say(embed)
      } 
    } 
    else {
      const embed = new Discord.MessageEmbed()
            .setAuthor(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            .setColor('YELLOW')
            .setDescription(`The proper information was not provided.\nExample of how to use the command:\n\`disable <command/category>\``)
        return receivedMessage.say(embed)
    }
  }
};

async function updateDisabledCommandsDB(guildId, disabledCommands) {
    
  result = await permissionsSettingsSchema.updateOne({ guildId: guildId }, { $set: { disabledCommands: disabledCommands} }, { upsert: true });
  
}

async function updateDisabledCommandGroupsDB(guildId, disabledCommandGroups) {
  
  result = await permissionsSettingsSchema.updateOne({ guildId: guildId }, { $set: { disabledCommandGroups: disabledCommandGroups} }, { upsert: true });
  
}

async function updateEnabledCommandsDB(guildId, enabledCommands) {
  
  result = await permissionsSettingsSchema.updateOne({ guildId: guildId }, { $set: { enabledCommands: enabledCommands} }, { upsert: true });
  
}