const Canvacord = require("canvacord").Canvas;
const Discord = require('discord.js');

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
