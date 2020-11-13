const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')
const request = require('request')

module.exports = class bitlyCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'bit.ly',
            aliases: ['bit-ly', 'bitly', 'shorten-url', 'short-url', 'url-shorten', 'url-short'],
            group: 'miscellaneous',
            memberName: 'bit.ly',
            description: 'Shortens a URL using bit.ly',
            examples: ['bit.ly <URL>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            return receivedMessage.say(`Please provide a valid URL to shorten!\n\`bit.ly <URL>\``)
        }
        const headers = {
            'Authorization': `Bearer ${config.bitlyApiKey}`,
            'Content-Type': 'application/json'
        };

        const dataString = `{ "long_url": "${arg}", "domain": "bit.ly" }`;

        const options = {
            url: 'https://api-ssl.bitly.com/v4/shorten',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        request(options, function (error, response, body) {
            let bitlyResponse = JSON.parse(body)
            if (error || !bitlyResponse.link) {
                return receivedMessage.say(`Oops, there was an error! Please make sure you provided a valid URL and try again.`)
            }
            else {
                return receivedMessage.say(bitlyResponse.link)
            }
        })
    }
};
