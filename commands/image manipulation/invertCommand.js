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
            description: 'Sends a user\'s avatar or an image of your choice with the colors inverted.',
            examples: ['invert <@UserMention>', 'invert <image>'],
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
            return receivedMessage.say("You must provide the image to be used in this command. Run the command again and either mention the user who's avatar you'd like to be used or send an image at the same time.\nExample: invert <@575416249400426506>")
        }
    }
};
