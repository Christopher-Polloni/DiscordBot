const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const Jimp = require('jimp');
const imageManipulationFunctions = require('../../util/imageManipulation');


module.exports = class flipImageCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'flip-image',
            group: 'imagemanipulation',
            memberName: 'flip-image',
            description: 'Sends a user\'s avatar or an image of your choice flipped over the x-axis, y-axis, or both.',
            examples: ['flip-image <type> <@UserMention>', 'flip-image <type> <image>', 'Types include horizontal, vertical or both'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {


        const horizontal = ['h', 'horizontal', 'horizontally']
        const vertical = ['v', 'vertical', 'vertically']
        const both = ['h/v', 'h+v', 'both']
        let type = args[0]
        if (type) type = type.toLowerCase()
        if (!args || !(horizontal.includes(type) || vertical.includes(type) || both.includes(type))) {
            return receivedMessage.say('Proper usage of this command requires the type of flip you\'d like the image to undergo.\n```flip-image <type> <@UserMention>\nflip-image <type> <image>```\nTo flip horizontally, the type would be: `h`, `horizontal` or `horizontally`\nTo flip vertically, the type would be: `v`, `vertical` or `vertically`\nTo flip both horizontally and vertically, the type would be: `h/v`, `h+v` or `both`\nExamples:\nflip-image horizontally <@575416249400426506>\nflip-image v <@575416249400426506>\nflip-image h+v <@575416249400426506>')
        }
        if (receivedMessage.mentions.members.first()) {
            return imageManipulationFunctions.flipImage(receivedMessage, receivedMessage.mentions.members.first().user.displayAvatarURL({ format: 'png' }), getFlips(type))
        }
        else if (receivedMessage.attachments.first()) {
            return imageManipulationFunctions.flipImage(receivedMessage, receivedMessage.attachments.first().url, getFlips(type))
        }
        else {
            return receivedMessage.say('Proper usage of this command requires the type of flip you\'d like the image to undergo.\n```flip-image <type> <@UserMention>\nflip-image <type> <image>```\nTo flip horizontally, the type would be: `h`, `horizontal` or `horizontally`\nTo flip vertically, the type would be: `v`, `vertical` or `vertically`\nTo flip both horizontally and vertically, the type would be: `h/v`, `h+v` or `both`\nExamples:\nflip-image horizontally <@575416249400426506>\nflip-image v <@575416249400426506>\nflip-image h+v <@575416249400426506>')
        }
    }
};


function getFlips(type) {
    const horizontal = ['h', 'horizontal', 'horizontally']
    const vertical = ['v', 'vertical', 'vertically']

    if (horizontal.includes(type)) return {horizontalFlip: true, verticalFlip: false}
    else if (vertical.includes(type)) return {horizontalFlip: false, verticalFlip: true}
    else return {horizontalFlip: true, verticalFlip: true}

}
