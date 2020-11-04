const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
// const redditApi = require("imageapi.js");
const randomPuppy = require('random-puppy');
const Discord = require('discord.js');

module.exports = class memeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'puppy',
            group: 'reddit',
            memberName: 'puppy',
            description: 'Retrieve an image from r/puppy',
            examples: ['$puppy'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
                
        randomPuppy().then(async url => {
            await receivedMessage.channel.send({
                files: [{
                    attachment: url,
                    name: 'puppy.png'
                }]
            })
        }).catch(err => console.error(err));

    };

};