const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const Canvacord = require("canvacord").Canvas;

module.exports = class changeMyMindCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'change-my-mind',
            group: 'imagemanipulation',
            memberName: 'change-my-mind',
            description: 'Sends a "Change My Mind" meme with the text of your choice.',
            examples: ['change-my-mind <text>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {

        if (!arg){
            return receivedMessage.say('You must provide text with this command.\n`change-my-mind <text>`')
        }
        const img = await Canvacord.changemymind(arg)

        if (img) {
            const attachment = new Discord.MessageAttachment(img);
            return receivedMessage.say(attachment);
        }
        else {
            return receivedMessage.say('There was an error! Please try again to receive your image.')
        }        
        
    }
};
