const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')

module.exports = class weatherCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'lmgtfy',
            aliases: ['let-me-google-that-for-you'],
            group: 'miscellaneous',
            memberName: 'lmgtfy',
            description: 'Creates a LMGTFY link with the search terms you provide.',
            examples: ['lmgtfy <search terms>', 'let-me-google-that-for-you <search terms>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            return receivedMessage.say(`http://lmgtfy.com`)
        }
        else {
            let query = encodeURIComponent(arg)
            return receivedMessage.say(`http://lmgtfy.com/?iie=1&q=${query}`)
        }
    }
};
