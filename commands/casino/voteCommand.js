const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const DBL = require("dblapi.js");
const casinoFunctions = require('../../util/casino');

module.exports = class voteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'casino',
            memberName: 'vote',
            description: 'Receive 5,000 credits after voting, double on the weekend!',
            examples: ['vote'],
            guildOnly: false,
            argsType: 'single',
        })
    }
    async run(receivedMessage, args) {
        const dbl = new DBL(config.topggApiKey, this.client);
        const hasVoted = await dbl.hasVoted(receivedMessage.author.id)
        const isWeekend = await dbl.isWeekend()

        if (!receivedMessage.author.casino.setup && !await casinoFunctions.loadCasinoSettings(receivedMessage)) {
            return receivedMessage.say('You must first set up your casino account before using any casino commands. To do this, simply run the `casino-setup` command.')
        }
        else if (!hasVoted) {
            const embed = new Discord.MessageEmbed()
                .setColor('YELLOW')
                .setDescription('You must vote for <@575416249400426506> before claiming your vote credits.\n[Click Here to Vote](https://top.gg/bot/575416249400426506/vote)\nAfter voting, use the `vote` command again to receive your credits')
                .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            return receivedMessage.say(embed)
        }
        else if (!receivedMessage.author.casino.voteCooldown) {
            receivedMessage.author.casino.voteCooldown = new Date()
            if (isWeekend) {
                receivedMessage.author.casino.balance = receivedMessage.author.casino.balance + 10000
                const embed = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Thanks for voting!')
                    .addField('Credits Added', '10,000', true)
                    .addField('New Balance', receivedMessage.author.casino.balance.toLocaleString(), true)
                    .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                updateVoteCooldownDB(receivedMessage.author.id, receivedMessage.author.casino.balance, receivedMessage.author.casino.voteCooldown)
                return receivedMessage.say(embed)
            }
            else {
                receivedMessage.author.casino.balance = receivedMessage.author.casino.balance + 5000
                const embed = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Thanks for voting!')
                    .addField('Credits Added', '5,000', true)
                    .addField('New Balance', receivedMessage.author.casino.balance.toLocaleString(), true)
                    .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                updateVoteCooldownDB(receivedMessage.author.id, receivedMessage.author.casino.balance, receivedMessage.author.casino.voteCooldown)
                return receivedMessage.say(embed)
            }

        }
        else {
            const now = new Date()
            const halfDay = 1000 * 60 * 60 * 12;
            const halfDayHasPassed = (now - receivedMessage.author.casino.voteCooldown) > halfDay;
            if (halfDayHasPassed) {
                if (isWeekend) {
                    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance + 10000
                    const embed = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setTitle('Thanks for voting!')
                        .addField('Credits Added', '10,000', true)
                        .addField('New Balance', receivedMessage.author.casino.balance.toLocaleString(), true)
                        .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                    updateVoteCooldownDB(receivedMessage.author.id, receivedMessage.author.casino.balance, receivedMessage.author.casino.voteCooldown)
                    return receivedMessage.say(embed)
                }
                else {
                    receivedMessage.author.casino.voteCooldown = now
                    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance + 5000
                    const embed = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setTitle('Thanks for voting!')
                        .addField('Credits Added', '5,000', true)
                        .addField('New Balance', receivedMessage.author.casino.balance.toLocaleString(), true)
                        .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                    updateVoteCooldownDB(receivedMessage.author.id, receivedMessage.author.casino.balance, receivedMessage.author.casino.voteCooldown)
                    return receivedMessage.say(embed)
                }
            }
            else {
                const timeDiff = new Date(halfDay) - (new Date(now) - new Date(receivedMessage.author.casino.voteCooldown))
                const humanTime = new Date(timeDiff).toISOString().substring(11, 19);
                const embed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Vote Credits Already Claimed!')
                    .setDescription('You already collected your free credits for voting within the past 12 hours.')
                    .addField('Time Until Next Available Claim', humanTime, true)
                    .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                return receivedMessage.say(embed)
            }
        }

    }
};

async function updateVoteCooldownDB(userId, balance, voteCooldown) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Casino").updateOne({ userId: userId }, { $set: { balance: balance, voteCooldown: voteCooldown } }, { upsert: true });
        await client2.close();
    } catch (e) {
        console.error(`Vote Cooldown update error. User: ${userId} Balance: ${balance} Vote Cooldown: ${voteCooldown}\n`, e)
    }
}