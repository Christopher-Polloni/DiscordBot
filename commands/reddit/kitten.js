const Commando = require('discord.js-commando');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))
// const redditApi = require("imageapi.js");
const randomPuppy = require('random-puppy');
const Discord = require('discord.js');

module.exports = class memeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'kitten',
            group: 'reddit',
            memberName: 'kitten',
            description: 'Retrieve an image from r/kittens',
            examples: ['$kitten'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
                
        randomPuppy("kittens").then(async url => {
            await receivedMessage.channel.send({
                files: [{
                    attachment: url,
                    name: 'cats.png'
                }]
            })
        }).catch(err => console.error(err));

    };

};