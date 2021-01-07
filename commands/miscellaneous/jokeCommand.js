const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const fetch = require('node-fetch');
const Discord = require('discord.js')

module.exports = class jokeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'joke',
            group: 'miscellaneous',
            memberName: 'joke',
            description: 'Be told a joke.',
            examples: ['joke'],
            guildOnly: false
        })
    }
    async run(receivedMessage) {

        fetch('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes')
            .then(response => response.json())
            .then(response => {
                const embed = new Discord.MessageEmbed()
                    .setColor('RANDOM')
                    .setDescription(`${response.setup}\n||${response.punchline}||`)
                    .setFooter(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
                    .setTimestamp()
                receivedMessage.say(embed)
                receivedMessage.delete()
                    .then()
                    .catch(err => console.error('Error deleting joke command:\n',err));
            })
    }
};
