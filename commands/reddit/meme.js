const Commando = require('discord.js-commando');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))
// const redditApi = require("imageapi.js");
const randomPuppy = require('random-puppy');
const Discord = require('discord.js');

module.exports = class memeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'meme',
            group: 'reddit',
            memberName: 'meme',
            description: 'Retrieve a meme from r/TrippinThroughTime or r/wholesomememes',
            nsfw: true,
            examples: ['$meme'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
        let subreddits = ["TrippinThroughTime", "wholesomememes", "memes", "funny"];
        let subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
        
        randomPuppy(subreddit).then(async url => {
            await receivedMessage.channel.send({
                files: [{
                    attachment: url,
                    name: 'meme.png'
                }]
            })
        }).catch(err => console.error(err));

    };

};