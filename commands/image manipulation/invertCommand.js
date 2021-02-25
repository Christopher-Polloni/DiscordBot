const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const imageManipulationFunctions = require('../../util/imageManipulation');

module.exports = class invertCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'invert',
            group: 'imagemanipulation',
            memberName: 'invert',
            description: 'Sends another user\'s avatar, an image of your choice, or your own avatar (if neither of the previous two options are provided) with the colors inverted.',
            examples: ['invert <@UserMention>', 'invert <image>', 'invert'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (receivedMessage.mentions.members.first()){
            return imageManipulationFunctions.invertImage(receivedMessage, receivedMessage.mentions.members.first().user.displayAvatarURL({ format: 'png' }))
        }
        else if (receivedMessage.attachments.first()) {
            return imageManipulationFunctions.invertImage(receivedMessage, receivedMessage.attachments.first().url)
        }
        else {
            return imageManipulationFunctions.invertImage(receivedMessage, receivedMessage.author.displayAvatarURL({ format: 'png' }))
        }
    }
};
