const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const Jimp = require('jimp');
const imageManipulationFunctions = require('../../util/imageManipulation');


module.exports = class rotateCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'rotate',
            group: 'imagemanipulation',
            memberName: 'rotate',
            description: 'Sends another user\'s avatar, an image of your choice, or your own avatar (if neither of the previous two options are provided) rotated clockwise by the number of degrees you specify',
            examples: ['rotate <degrees> <@UserMention>', 'rotate <degrees> <image>', 'rotate <degrees>'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {

        if (!args || isNaN(args[0]) || Number(args[0]) < 1 || Number(args[0]) > 359){
            return receivedMessage.say('Proper usage of this command requires the amount of degrees (1-359) to rotate the image.\n```rotate <degrees> <@UserMention>\nrotate <degrees> <image>\nrotate <degrees>```\nExample: rotate 90 <@575416249400426506>')
        }
        if (receivedMessage.mentions.members.first()){
            return imageManipulationFunctions.rotateImage(receivedMessage, receivedMessage.mentions.members.first().user.displayAvatarURL({ format: 'png' }), Number(args[0]))
        }
        else if (receivedMessage.attachments.first()) {
            return imageManipulationFunctions.rotateImage(receivedMessage, receivedMessage.attachments.first().url, Number(args[0]))
        }
        else {
            return imageManipulationFunctions.rotateImage(receivedMessage, receivedMessage.author.displayAvatarURL({ format: 'png' }), Number(args[0]))
        }
    }
};