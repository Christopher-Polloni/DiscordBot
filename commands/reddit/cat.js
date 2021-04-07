const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const fetch = require("node-fetch");
const Discord = require('discord.js');

module.exports = class catCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'cat',
            aliases: ['cats', 'kitten', 'kittens'],
            group: 'reddit',
            memberName: 'cat',
            description: 'Retrieve an image from r/cats.',
            examples: ['cat'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage) {
        getKitten(receivedMessage);
    }
}

async function getKitten(receivedMessage) {

    const sortByTimeOptions = ["hour", "day", "week", "month", "year", "all"];
    const sortByTime = sortByTimeOptions[Math.floor(Math.random() * sortByTimeOptions.length)];

    const url = `https://api.reddit.com/r/cats/top.json?sort=top&t=${sortByTime}&limit=100`

    fetch(url)
        .then(response => response.json())
        .then(response => {
            let i = Math.floor(Math.random() * response.data.children.length)
            console.log(response.data.children[i].data.url)
            if ((response.data.children[i].data.url.endsWith('.jpg')) || (response.data.children[i].data.url.endsWith('.png'))) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(`r/cats`)
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
                return getKitten(receivedMessage)
            }
        });

}