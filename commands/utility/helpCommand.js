const Commando = require("discord.js-commando");
const path = require("path");
const config = require("../../config.js");
const Discord = require("discord.js");

module.exports = class helpCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "help",
      group: "util",
      memberName: "help",
      description: "Receive information on commands.",
      examples: [`help', 'help <command>`, 'help <category>'],
      guildOnly: false,
      argsType: "single",
    });
  }
  async run(receivedMessage, arg) {
    let prefixInfo 
    if (receivedMessage.guild) {
      prefixInfo = receivedMessage.guild._commandPrefix 
      ? `Server: **${receivedMessage.guild.name}**\nPrefix: **${receivedMessage.guild._commandPrefix}** or ${this.client.user}`
      : `Server: **${receivedMessage.guild.name}**\nDefault Prefix: **$** or ${this.client.user}`;
    }
    else {
      prefixInfo = `Default Prefix: **$** or ${this.client.user}`
    }
    const links =
      "[Support Server](https://discord.gg/HKUPd8Wgfk) | [Patreon](https://www.patreon.com/discord_bot_boop) | [Top.gg](https://Top.gg/bot/575416249400426506) | [Top.gg Vote](https://Top.gg/bot/575416249400426506/vote) | [Invite](https://discord.com/oauth2/authorize?client_id=575416249400426506&permissions=2081418495&scope=bot%20applications.commands)\n";
    const embed = new Discord.MessageEmbed()
      .setColor("BLUE")
      .setTitle("boop | Help Menu")

    if (arg) {
      if (this.client.registry.findCommands(arg).length > 0) {
        const command = this.client.registry.findCommands(arg)[0]
        const commandDescription = `${command.description}\n`
        let commandSideNote = ''
        if (command.guildOnly && command.nsfw){
          commandSideNote = `(Server Only + NSFW Command)`
        }
        else if (command.guildOnly && !command.nsfw){
          commandSideNote = `(Server Only Command)`
        }
        const commandAliases = (command.aliases && command.aliases.length > 0) ? `**Aliases:** ${command.aliases.join(', ')}\n` : '';
        const commandUserPermissions = (command.userPermissions && command.userPermissions.length > 0) ? `**Required User Permissions:** ${command.userPermissions.join(', ')}\n` : '';
        const commandClientPermissions = (command.clientPermissions && command.clientPermissions.length > 0) ? `**Required Bot Permissions:** ${command.clientPermissions.join(', ')}\n` : '';
        const commandExamples = (command.examples && command.examples.length > 0) ? `**Usage:**\n ${command.examples.join('\n')}\n` : '';
        const commandInfo = commandDescription + commandAliases + commandUserPermissions + commandClientPermissions + commandExamples
        embed.setDescription(`${prefixInfo}\n${links}\n**${command.name}** ${commandSideNote}\n${commandInfo}`)
        receivedMessage.say(embed)
      }
      else if (this.client.registry.findGroups(arg).length > 0) {
        const group = this.client.registry.findGroups(arg)[0];
        const commands = group.commands.array();
        for (let i = 0; i < commands.length; i++) {
          embed.addField(commands[i].name, commands[i].description);
        }
        embed.setDescription(`${prefixInfo}\n${links}\n**${group.name}**`)
        receivedMessage.say(embed);
      } 
      else {
        defaultHelp(receivedMessage, this.client, embed, prefixInfo, links)
      }
    } else {
      defaultHelp(receivedMessage, this.client, embed, prefixInfo, links)
    }
  }
};

function defaultHelp(receivedMessage, client, embed, prefixInfo, links){
  let commandGroups = client.registry.groups
        .filter((group) => group.name !== "Commands")
        .array();

      for (let i = 0; i < commandGroups.length; i++) {
        let message = "";
        if (commandGroups[i].name !== "Commands") {
          let commandNames = commandGroups[i].commands.map(
            (command) => command.name
          );
          let commandNamesString = commandNames.join("`, `");
          embed.addField(commandGroups[i].name, `\`${commandNamesString}\``);
        }
      }
      embed.setDescription(`${prefixInfo}\nTo learn more about a category or specific command: help <category> or help <command>\n${links}`)
      receivedMessage.say(embed);
}