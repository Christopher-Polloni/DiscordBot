const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class roleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'botinvite',
            group: 'util',
            memberName: 'botinvite',
            description: 'Invite this bot to a server you manage.',
            examples: [`botinvite`],
            guildOnly: false,
        })
    }
    async run(receivedMessage) {
        receivedMessage.say(`https://discord.com/api/oauth2/authorize?client_id=575416249400426506&permissions=8&scope=bot`)
    }

};
