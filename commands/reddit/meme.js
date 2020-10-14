const Commando = require('discord.js-commando');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))
// const redditApi = require("imageapi.js");
const fetch = require("node-fetch");
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

        const sortByTimeOptions = ["hour", "day", "week", "month", "year", "all"];
        const sortByTime = sortByTimeOptions[Math.floor(Math.random() * sortByTimeOptions.length)];

        const subredditOptions = ["meme", "memes", "TrippinThroughTime", "funny"];
        const selectedSubreddit = subredditOptions[Math.floor(Math.random() * subredditOptions.length)];

        fetch(`https://api.reddit.com/r/${selectedSubreddit}/top.json?sort=top&t=${sortByTime}&limit=100`)
            .then(response => response.json())
            .then(response => {
                let i = Math.floor(Math.random() * response.data.children.length)
                receivedMessage.channel.send({
                            files: [{
                                attachment: response.data.children[i].data.url,
                                name: 'meme.png'
                            }]
                        })
            });

        
    };

};