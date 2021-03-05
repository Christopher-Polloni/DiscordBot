const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const imageManipulationFunctions = require('../../util/imageManipulation');

module.exports = class slapCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'slap',
            group: 'imagemanipulation',
            memberName: 'slap',
            description: 'Sends a Batman/Robin slap meme with your avatar\'s image as Batman and an image of your choice or another user\'s avatar as Robin.',
            examples: ['slap <@UserMention>', 'slap <image>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        const batman = receivedMessage.author.displayAvatarURL({ format: 'png' })
        if (receivedMessage.mentions.members.first()){
            return imageManipulationFunctions.slapImage(receivedMessage, receivedMessage.mentions.members.first().user.displayAvatarURL({ format: 'png' }))
        }
        else if (receivedMessage.attachments.first()) {
            return imageManipulationFunctions.slapImage(receivedMessage, receivedMessage.attachments.first().url)
        }
        else {
            return receivedMessage.say('You must mention another user to slap or send an image with the command.')
        }
     
        
        
    }
};
