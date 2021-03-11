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
            description: 'Sends a Batman/Robin slap meme with a user\'s avatar or image of your choice as Robin. You will then be prompted for the image to replace Batman, which is optional.',
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
            return receivedMessage.say("You must provide the image to be used in this command. Run the command again and either mention the user who's avatar you'd like to be used or send an image at the same time.\nExample: slap <@575416249400426506>")
        }
     
        
        
    }
};
