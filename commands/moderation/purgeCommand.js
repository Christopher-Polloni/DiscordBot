const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class inviteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            aliases: ['delete-messages', 'deletemessages'],
            group: 'moderation',
            memberName: 'purge',
            description: 'Delete a certain amount of messages in the channel.',
            examples: [`purge <# of messages>`],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_MESSAGES']
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            return receivedMessage.say(`You forgot to mention how many messages to delete. For example: \`purge 10\``)
        }
        const numberOfMessages = Number(arg);
        if (numberOfMessages == NaN) {
            return receivedMessage.say(`You must enter a valid number between 1 and 100 in order to delete previous messages in this channel. For example: \`purge 10\``)
        }
        if (numberOfMessages >= 0 && numberOfMessages <= 100) {
            receivedMessage.channel.bulkDelete(numberOfMessages, true)
                .then((messages) => {
                    const embed = new Discord.MessageEmbed()
                        .setTitle('Bulk Message Delete')
                        .setDescription(`${messages.size} message(s) deleted in ${receivedMessage.channel}`)
                        .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
                    return receivedMessage.say(embed);
                })
                .catch(err => {
                    console.error(err);
                    return receivedMessage.say(`There was an error deleting some or all of the messages.`);
                });
        }
    }
};
