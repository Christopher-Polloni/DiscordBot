const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const casinoFunctions = require('../../util/casino');
const casinoSchema = require('../../schemas/casinoSchema');

module.exports = class casinoSetupCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'casino-setup',
            group: 'casino',
            memberName: 'casino-setup',
            description: 'Setup your casino account so you can use any casino command',
            examples: ['casino-setup'],
            guildOnly: false,
            argsType: 'single',
            throttling: {
                usages: 1,
                duration: 30
            },
        })
    }
    async run(receivedMessage, args) {
        if (receivedMessage.author.casino.setup || await casinoFunctions.loadCasinoSettings(receivedMessage)) {
            console.log(receivedMessage.author.casino.setup)
            console.log(await casinoFunctions.loadCasinoSettings(receivedMessage))
            return receivedMessage.say('You already initialized your casino account. This command only needs to be run once.')
        }
        else {
            return initializeUserCasino(receivedMessage)
        }

    }
};


async function initializeUserCasino(receivedMessage) {
    
    result = await casinoSchema.updateOne({ userId: receivedMessage.author.id }, { $set: { userId: receivedMessage.author.id, balance: 10000 } }, { upsert: true });
    
    if (!result) {
        return receivedMessage.say("An error occurred. Please run the command again.")
    }
    else {
        receivedMessage.author.casino.setup = true
        receivedMessage.author.casino.balance = 10000
        receivedMessage.channel.stopTyping(true)
        const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setDescription('**Your account has been created and given 10,000 credits!**')
            .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
        return receivedMessage.say(embed)
    }
}