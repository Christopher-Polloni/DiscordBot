const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
// const redditApi = require("imageapi.js");
const randomPuppy = require('random-puppy');
const Discord = require('discord.js');

module.exports = class memeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'kitten',
            group: 'reddit',
            memberName: 'kitten',
            description: 'Retrieve an image from r/kittens.',
            examples: ['kitten'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
        randomPuppy("kittens").then(url => {
            const embed = new Discord.MessageEmbed()
                .setTitle('r/kittens')
                .setColor('RANDOM')
                .setImage(url)
                .setFooter(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
                .setTimestamp()
            receivedMessage.say(embed)
            receivedMessage.delete()
                .then()
                .catch(err => console.error(err));
        }).catch(err => console.error(err));
    };

};