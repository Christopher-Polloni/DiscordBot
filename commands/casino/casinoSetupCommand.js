const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const { NONAME } = require('dns');

module.exports = class casinoSetupCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'casino-setup',
            aliases: ['casinosetup'],
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
        if (receivedMessage.author.casino.setup) {
            return receivedMessage.say('You already initialized your casino account. This command only needed to be run once.')
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
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Casino").updateOne({ userId: receivedMessage.author.id }, { $set: {userId: receivedMessage.author.id, balance: 10000} }, { upsert: true });
        await client2.close();
        receivedMessage.author.casino.setup = true
        receivedMessage.author.casino.balance = 10000
        return receivedMessage.say('Your account has been created and given 10,000 credits!')
    } catch (e) {
        console.error(e);
        receivedMessage.say("An error occurred. Please run the command again.")
    }
  }