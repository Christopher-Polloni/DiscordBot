const Canvacord = require("canvacord").Canvas;
const Discord = require('discord.js');
const Jimp = require('jimp')

exports.slapImage = async (receivedMessage, img1, img2) => {

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

exports.deleteImage = async (receivedMessage, img1) => {

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