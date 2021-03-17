const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const Jimp = require('jimp');
const imageManipulationFunctions = require('../../util/imageManipulation');


module.exports = class lisaPresentationCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'lisa-presentation',
            aliases: ['lisa'],
            group: 'imagemanipulation',
            memberName: 'lisa-presentation',
            description: 'Sends a Lisa (from The Simpsons) presentation meme with the text you provide.',
            examples: ['lisa-presentation <text>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {

        if (!arg) {
            return receivedMessage.say('You must provide text with this command.\n`lisa-presentation <text>`')
        }

        var properArg = arg
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"');

        const font = await imageManipulationFunctions.getJimpFontSize(properArg, 375, 252)

        if (!font) {
            return receivedMessage.say('The text you provided is too long and would be hard to read. Shorten it a bit and try again.')
        }
        const img = await Jimp.read(path.join(__dirname, '..', '..', 'images', 'lisa-presentation.png'))
        img.print(font, 110, 45, {
            text: properArg,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, 450, 252);
        const image = await img.getBufferAsync(Jimp.MIME_PNG)
        const attachment = new Discord.MessageAttachment(image);
        return receivedMessage.say(attachment);
    }
};