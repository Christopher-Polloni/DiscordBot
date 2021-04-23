const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const reactionRolesSchema = require('../../schemas/reactionRolesSchema.js');

module.exports = class reactionRolesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'reaction-roles',
            aliases: ['reaction-role', 'rr'],
            group: 'reaction roles',
            memberName: 'reaction-roles',
            description: 'Set up a message so members can add/remove roles by reacting to the message.',
            examples: [`reaction-roles <#channel>\n<emoji 1> <@role 1> <description>\n<emoji 2> <@role 2> <description>\n<emoji 3> <@role 3> <description>`],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, args) {
        
        let roleError = false
        const reactions = []
        const roles = []
        if (!args) {
            console.log(receivedMessage.guild.guildSettings.reactionRoles)
            return receivedMessage.say('To properly use this command, use the following format, ensuring that each option is on a new line within the original message.\n```reaction-roles <#channel>\n<emoji 1> <@role 1> <description>\n<emoji 2> <@role 2> <description>\n<emoji 3> <@role 3> <description>```')
        }
        if (receivedMessage.mentions.channels.first()) {
            const channelId = receivedMessage.mentions.channels.first().id;
            const channel = receivedMessage.guild.channels.cache.find(ch => ch.id === channelId);
            const allArgs = args.split('\n')
            const options = allArgs.slice(1)

            let pollOptions = '';
            options.forEach((element, index) => {
                pollOptions = pollOptions.concat(`${element}\n`)
                let splitArgs = element.split(' ')
                if (splitArgs[0].includes(':')) {
                    const emojiName = splitArgs[0].split(':')[1]
                    let emoji = receivedMessage.guild.emojis.cache.find(e => { return e.name == emojiName })
                    reactions.push(emoji.id)
                    let role = splitArgs[1]
                    if (role.startsWith('<@&')) {
                        role = role.substring(3, role.length - 1)
                        roles.push(role)
                    }
                    else {
                        roleError = true
                    }
                }
                else {
                    reactions.push(splitArgs[0])
                    let role = splitArgs[1]
                    if (role.startsWith('<@&')) {
                        role = role.substring(3, role.length - 1)
                        roles.push(role)
                    }
                    else {
                        roleError = true
                    }

                }
            })

            if (roleError) {
                return receivedMessage.say('One of your roles was not mentioned properly in the correct location of the message. Please try again.')
            }
            else {
                const embed = new Discord.MessageEmbed()
                    .setColor('BLUE')
                    .setDescription(pollOptions)
                channel.send(`React to add/remove a role`, embed).then(function (message) {
                    for (let i = 0; i < options.length; i++) {
                        message.react(reactions[i] || message.guild.emojis.cache.get(reactions[i]))
                    }
                    addReactionRoleMessage({ guildId: message.guild.id, messageId: message.id, emoji: reactions, roles: roles }, receivedMessage, message)

                }).catch(function (error) {
                    console.error('Error adding reaction role message to db: ', error)
                });
            }
        }
        else {
            return receivedMessage.say('You must mention a channel for the poll to be sent in!. Run \`reaction-roles\` to see an example.')
        }
    }
};


async function addReactionRoleMessage(data, receivedMessage, message) {
    try {
        result = await reactionRolesSchema.create(data);
        message.guild.guildSettings.reactionRoles.push(data)
        return
    } catch (e) {
        console.error(e);
        receivedMessage.say("There was an error uploading to the database. Please run the command again. The reaction role message will be deleted in 10 seconds.")
        setTimeout(() => message.delete(), 10000);
    }
  }