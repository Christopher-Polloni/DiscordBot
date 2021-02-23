const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const casinoFunctions = require('../../util/casino');

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
        if (receivedMessage.author.casino.setup && !await casinoFunctions.loadCasinoSettings(receivedMessage)) {
            return receivedMessage.say('You already initialized your casino account. This command only needs to be run once.')
        }
        else {
            return initializeUserCasino(receivedMessage)
        }

    }
};


async function initializeUserCasino(receivedMessage) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        receivedMessage.channel.startTyping(5)
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Casino").updateOne({ userId: receivedMessage.author.id }, { $set: { userId: receivedMessage.author.id, balance: 10000 } }, { upsert: true });
        await client2.close();
        receivedMessage.author.casino.setup = true
        receivedMessage.author.casino.balance = 10000
        receivedMessage.channel.stopTyping(true)
        const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setDescription('**Your account has been created and given 10,000 credits!**')
            .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
        return receivedMessage.say(embed)
    } catch (e) {
        console.error(e);
        receivedMessage.say("An error occurred. Please run the command again.")
    }
}