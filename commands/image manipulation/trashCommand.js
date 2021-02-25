const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const imageManipulationFunctions = require('../../util/imageManipulation');

module.exports = class trashCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'trash',
            group: 'imagemanipulation',
            memberName: 'trash',
            description: 'Sends a "Peter Parker Glasses" meme with another user\'s avatar, an image of your choice, or your own avatar (if neither of the previous two options are provided) as a blurry image, and trash as the clear image.',
            examples: ['trash <@UserMention>', 'trash <image>', 'trash'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (receivedMessage.mentions.members.first()){
            return imageManipulationFunctions.trashImage(receivedMessage, receivedMessage.mentions.members.first().user.displayAvatarURL({ format: 'png' }))
        }
        else if (receivedMessage.attachments.first()) {
            return imageManipulationFunctions.trashImage(receivedMessage, receivedMessage.attachments.first().url)
        }
        else {
            return imageManipulationFunctions.trashImage(receivedMessage, receivedMessage.author.displayAvatarURL({ format: 'png' }))
        }
    }
};
