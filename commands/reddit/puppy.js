const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const fetch = require("node-fetch");
const Discord = require('discord.js');

module.exports = class memeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'puppy',
            group: 'reddit',
            memberName: 'puppy',
            description: 'Retrieve an image from r/puppy.',
            examples: ['puppy'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage) {
        getPuppy(receivedMessage)
    };
};

async function getPuppy(receivedMessage) {

    const sortByTimeOptions = ["hour", "day", "week", "month", "year", "all"];
    const sortByTime = sortByTimeOptions[Math.floor(Math.random() * sortByTimeOptions.length)];

    const url = `https://api.reddit.com/r/puppy/top.json?sort=top&t=${sortByTime}&limit=100`

    fetch(url)
        .then(response => response.json())
        .then(response => {
            let i = Math.floor(Math.random() * response.data.children.length)
            console.log(response.data.children[i].data.url)
            if ((response.data.children[i].data.url.endsWith('.jpg')) || (response.data.children[i].data.url.endsWith('.png'))) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(`r/puppy`)
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
                return getPuppy(receivedMessage)
            }
        });

}