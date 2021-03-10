const Canvacord = require("canvacord").Canvas;
const Discord = require('discord.js');
const Jimp = require('jimp')
const path = require('path');

exports.slapImage = async (receivedMessage, img2) => {

    const acceptedResponses = ['no', 'n']
    const filter = m => receivedMessage.author.id === m.author.id && (acceptedResponses.includes(m.content.toLowerCase()) || m.attachments.first() || m.mentions.members.first())

    receivedMessage.say("Would you like to provide an image to replace Batman as the person doing the slapping?\nType **no** to receive the image with Batman doing the slapping.\nTo have another user's avatar replace Batman, send a message mentioning that user.\nTo have any image replace Batman, send that image.\nIf there is no response meeting these requirements within the next 15 seconds, the command will proceed as if you typed no.")
    receivedMessage.channel.awaitMessages(filter, { time: 15000, max: 1, errors: ['time'] })
        .then(async (message, batman) => {
            if (acceptedResponses.includes(message.first().content.toLowerCase())) {
                this.createSlapImage(receivedMessage, path.join(__dirname, '..', 'images', 'transparent.png'), img2)
            }
            else if (message.first().mentions.members.first()) {
                const batman = await Canvacord.circle(message.first().mentions.members.first().user.displayAvatarURL({ format: 'png' }))
                this.createSlapImage(receivedMessage, batman, img2)
            }
            else {
                const batman = await Canvacord.circle(message.first().attachments.first().url)
                this.createSlapImage(receivedMessage, batman, img2)
            }
        })
        .catch(async (e) => {
            this.createSlapImage(receivedMessage, path.join(__dirname, '..', 'images', 'transparent.png'), img2)
        });

}

exports.createSlapImage = async (receivedMessage, img1, img2) => {

    const batman = await Canvacord.circle(img1)
    const robin = await Canvacord.circle(img2)
    const img = await Canvacord.slap(batman, robin)

    if (img) {
        const attachment = new Discord.MessageAttachment(img);
        return receivedMessage.say(attachment);
    }
    else {
        return receivedMessage.say('There was an error creating the image. If using an image instead of mentioning a user, try to use a `.png` or `.jpg` file.')
    }

}

exports.trashImage = async (receivedMessage, img1) => {

    const img = await Canvacord.trash(img1)

    if (img) {
        const attachment = new Discord.MessageAttachment(img);
        return receivedMessage.say(attachment);
    }
    else {
        return receivedMessage.say('There was an error creating the image. If using an image instead of mentioning a user, try to use a `.png` or `.jpg` file.')
    }

}

exports.wantedImage = async (receivedMessage, img1) => {

    const img = await Canvacord.wanted(img1)

    if (img) {
        const attachment = new Discord.MessageAttachment(img);
        return receivedMessage.say(attachment);
    }
    else {
        return receivedMessage.say('There was an error creating the image. If using an image instead of mentioning a user, try to use a `.png` or `.jpg` file.')
    }

}

exports.invertImage = async (receivedMessage, img1) => {

    const img = await Canvacord.invert(img1)

    if (img) {
        const attachment = new Discord.MessageAttachment(img);
        return receivedMessage.say(attachment);
    }
    else {
        return receivedMessage.say('There was an error creating the image. If using an image instead of mentioning a user, try to use a `.png` or `.jpg` file.')
    }

}

exports.deleteFileImage = async (receivedMessage, img1) => {

    const img = await Canvacord.delete(img1)

    if (img) {
        const attachment = new Discord.MessageAttachment(img);
        return receivedMessage.say(attachment);
    }
    else {
        return receivedMessage.say('There was an error creating the image. If using an image instead of mentioning a user, try to use a `.png` or `.jpg` file.')
    }

}

exports.getJimpFontSize = async (text, maxWidth, maxHeight) => {

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
    const font2 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)
    if (Jimp.measureTextHeight(font, text, maxWidth) <= maxHeight) {
        return font
    }
    else if (Jimp.measureTextHeight(font2, text, maxWidth) <= maxHeight) {
        return font2
    }
    else {
        return false
    }

}

exports.rotateImage = async (receivedMessage, img, degrees) => {

    const image = await Jimp.read(img);
    image.rotate(degrees);
    const imagetoSend = await image.getBufferAsync(Jimp.MIME_PNG)
    const attachment = new Discord.MessageAttachment(imagetoSend);
    return receivedMessage.say(attachment);

}

exports.flipImage = async (receivedMessage, img, flips) => {

    const image = await Jimp.read(img);
    image.flip(flips.horizontalFlip, flips.verticalFlip);
    const imagetoSend = await image.getBufferAsync(Jimp.MIME_PNG)
    const attachment = new Discord.MessageAttachment(imagetoSend);
    return receivedMessage.say(attachment);

}

exports.getJimpFontSizeBart = async (text, maxWidth) => {

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    
    if (Jimp.measureText(font, text) > maxWidth) {
        return {fits: false}
    }
    else {
        let longerText = text;
        let fits = true;
        do {
            if (Jimp.measureText(font, `${longerText} ${text}`) > maxWidth) {
                fits = false
            }
            else {
                longerText = `${longerText} ${text}`
            }
          }
          while (fits);    
        return {fits: true, font: font, text: longerText}
    }

}