const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const Jimp = require('jimp');
const imageManipulationFunctions = require('../../util/imageManipulation');


module.exports = class bartChalkboardCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'bart-chalkboard',
            aliases: ['bart'],
            group: 'imagemanipulation',
            memberName: 'bart-chalkboard',
            description: 'Sends an image of Bart (from The Simpsons) writing the text you provide on a chalkboard.',
            examples: ['bart-chalkboard <text>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {

        if (!arg) {
            return receivedMessage.say('You must provide text with this command.\n`bart-chalkboard <text>`')
        }

        const result = await imageManipulationFunctions.getJimpFontSizeBart(arg, 485)

        if (!result.fits) {
            return receivedMessage.say('The text you provided is too long. Shorten it a bit and try again.')
        }
        const img = await Jimp.read(path.join(__dirname, '..', '..', 'images', 'bart-chalkboard.png'))
        for (let i = 16; i <= 226; i += 35) {
            img.print(result.font, 16, i, {
                text: result.text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            }, 510, 10);
        }

        const image = await img.getBufferAsync(Jimp.MIME_PNG)
        const attachment = new Discord.MessageAttachment(image);
        return receivedMessage.say(attachment);
    }
};