const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const imageManipulationFunctions = require('../../util/imageManipulation');

module.exports = class deleteFileCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'delete-file',
            group: 'imagemanipulation',
            memberName: 'delete-file',
            description: 'Sends an image with another user\'s avatar, an image of your choice, or your own avatar (if neither of the previous two options are provided) as a file you are deleting from your computer.',
            examples: ['delete-file <@UserMention>', 'delete-file <image>', 'delete-file'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (receivedMessage.mentions.members.first()){
            return imageManipulationFunctions.deleteFileImage(receivedMessage, receivedMessage.mentions.members.first().user.displayAvatarURL({ format: 'png' }))
        }
        else if (receivedMessage.attachments.first()) {
            return imageManipulationFunctions.deleteFileImage(receivedMessage, receivedMessage.attachments.first().url)
        }
        else {
            return imageManipulationFunctions.deleteFileImage(receivedMessage, receivedMessage.author.displayAvatarURL({ format: 'png' }))
        }
    }
};
