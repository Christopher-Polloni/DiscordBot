const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const fetch = require("node-fetch");
const Discord = require('discord.js');

module.exports = class memeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'meme',
            group: 'reddit',
            memberName: 'meme',
            description: 'Retrieve a meme from a variety of subreddits.',
            nsfw: true,
            examples: ['meme'],
            guildOnly: true,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
        return getMeme(receivedMessage);
    };
};

async function getMeme(receivedMessage) {

    const sortByTimeOptions = ["hour", "day", "week", "month", "year", "all"];
    const sortByTime = sortByTimeOptions[Math.floor(Math.random() * sortByTimeOptions.length)];

    const subredditOptions = ["meme", "memes", "TrippinThroughTime", "funny"];
    const selectedSubreddit = subredditOptions[Math.floor(Math.random() * subredditOptions.length)];
    const url = `https://api.reddit.com/r/${selectedSubreddit}/top.json?sort=top&t=${sortByTime}&limit=100`

    fetch(url)
        .then(response => response.json())
        .then(response => {
            let i = Math.floor(Math.random() * response.data.children.length)
            console.log(response.data.children[i].data.url)
            if ((response.data.children[i].data.url.endsWith('.jpg')) || (response.data.children[i].data.url.endsWith('.png'))) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(`r/${selectedSubreddit}`)
                    .setColor('RANDOM')
                    .setImage(response.data.children[i].data.url)
                    .setFooter(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
                    .setTimestamp()
                receivedMessage.say(embed)
                receivedMessage.delete()
                    .then()
                    .catch(err => console.error(err));
            }
            else {
                return getMeme(receivedMessage)
            }
        });

}