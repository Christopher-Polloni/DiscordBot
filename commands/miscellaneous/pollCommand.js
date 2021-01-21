const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class pollCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'miscellaneous',
            memberName: 'poll',
            description: 'Set up a poll in a channel.',
            examples: [`poll <channel>\n<question>\n<option 1>\n<option 2>\n<option 3>`],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, args) {
        const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        if (!args) {
            return receivedMessage.say('To properly use this command, use the following format, ensuring that the question and each option are on a new line within the original message. A number emoji will automatically be added to each option\n```poll <channel>\n<question>\n<option 1>\n<option 2>\n<option 3>```')
        }
        if (receivedMessage.mentions.channels.first()) {
            const channelId = receivedMessage.mentions.channels.first().id;
            const channel = receivedMessage.guild.channels.cache.find(ch => ch.id === channelId);
            const allArgs = args.split('\n')
            if (allArgs.length < 4) {
                return receivedMessage.say('You must ask a question and provide at least two possible responses.')
            }
            if (allArgs.length > 12) {
                return receivedMessage.say('The maximum number of options per poll is 6.')
            }
            const question = allArgs[1]
            const options = allArgs.slice(2)

            let pollOptions = '';
            options.forEach((element, index) => {
                pollOptions = pollOptions.concat(`${reactions[index]} ${element}\n`)
            })
            const embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setDescription(pollOptions)
            channel.send(`📊 ${question}`, embed).then(function (message) {
                for (let i=0; i<options.length; i++){
                    message.react(reactions[i])
                }
            }).catch(function (error) {
                console.error(error)
            });

        }
        else {
            return receivedMessage.say('You must mention a channel for the poll to be sent in!. Run \`poll\` to see an example of how to make a poll.')
        }


    }
};
