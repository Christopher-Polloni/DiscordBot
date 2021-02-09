const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class slotsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'slot',
            aliases: ['slots'],
            group: 'casino',
            memberName: 'slot',
            description: 'Play slots',
            examples: ['slot <bet>'],
            guildOnly: false,
            argsType: 'single'
        })
    }
    async run(receivedMessage, args) {
        if (!receivedMessage.author.casino.setup) {
            return receivedMessage.say('You must first set up your casino account before using any casino commands. To do this, simply run the `casino-setup` command.')
        }
        if (!args) {
            const embed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Slot Machine Payouts')
                .setDescription('🍌🍌🍌 - 0.5x\n🍇🍇❓ - 1.5x\n🍇🍇🍇 - 2x\n🍊🍊❓ - 2x\n🍒🍒❓ - 2.5x\n🍊🍊🍊 - 3x\n🍒🍒🍒 - 3.5x\n💎💎❓ - 4x\n💰💰❓ - 10x\n💎💎💎 - 7x\n💰💰💰 - 15x')
                .setFooter('Usage: slot <bet>')
            return receivedMessage.say(embed)
        }
        else if (!Number.isInteger(Number(args)) || (args > receivedMessage.author.casino.balance) || (args < 0)) {
            return receivedMessage.say('The amount you bet must be a valid integer below or equal to your current balance. To view your balance use the `credits` command.')
        }
        else {
            const reel = ['🍊', '🍇', '💎', '🍇', '🍌', '🍒', '🍇', '🍌', '🍌', '🍒', '🍊', '🍌', '🍌', '💎', '🍊', '💰', '🍒', '🍇', '🍊', '🍇']
            const payout = {
                "🍌": {
                    semiJackpot: null,
                    jackpot: "0.5"
                },
                "🍇": {
                    semiJackpot: "1.5",
                    jackpot: "2"
                },
                "🍊": {
                    semiJackpot: "2",
                    jackpot: "3"
                },
                "🍒": {
                    semiJackpot: "2.5",
                    jackpot: "3.5"
                },
                "💎": {
                    semiJackpot: "4",
                    jackpot: "7"
                },
                "💰": {
                    semiJackpot: "10",
                    jackpot: "15"
                }
            }
            const slotsTopRow = [], slotsWinningRow = [], slotsBottomRow = []
            const index1 = Math.floor(Math.random() * reel.length)
            const index2 = Math.floor(Math.random() * reel.length)
            const index3 = Math.floor(Math.random() * reel.length)
            slotsTopRow.push(reel[index1 - 1] || reel[reel.length - 1]), slotsWinningRow.push(reel[index1]), slotsBottomRow.push(reel[index1 + 1] || reel[0])
            slotsTopRow.push(reel[index2 - 1] || reel[reel.length - 1]), slotsWinningRow.push(reel[index2]), slotsBottomRow.push(reel[index2 + 1] || reel[0])
            slotsTopRow.push(reel[index3 - 1] || reel[reel.length - 1]), slotsWinningRow.push(reel[index3]), slotsBottomRow.push(reel[index3 + 1] || reel[0])

            const jackpot = array => array.every(value => value === array[0])

            const slotMachine = `**| ${slotsTopRow[0]} | ${slotsTopRow[1]} | ${slotsTopRow[2]} | \n------------------\n| ${slotsWinningRow[0]} | ${slotsWinningRow[1]} | ${slotsWinningRow[2]} |  ⬅️\n------------------\n| ${slotsBottomRow[0]} | ${slotsBottomRow[1]} | ${slotsBottomRow[2]} |**`

            if (jackpot(slotsWinningRow)) {
                if ((slotsWinningRow[0] == "🍌") && args == 1) {
                    const embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setDescription(slotMachine)
                        .addField('Profit', `**0** credits`, true)
                        .addField('Credits', `You now have ${receivedMessage.author.casino.balance} credits`, true)
                    updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance)
                    return receivedMessage.say(embed)
                }
                else {
                    const winnings = Math.ceil(args * payout[slotsWinningRow[0]].jackpot)
                    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - args + winnings
                    const embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setDescription(slotMachine + '\n**-- YOU WON --**')
                        .addField('Profit', `**${winnings}** credits`, true)
                        .addField('Credits', `You now have ${receivedMessage.author.casino.balance} credits`, true)
                    updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance)
                    return receivedMessage.say(embed)
                }
            }
            else {
                const duplicate = array => { return array.length !== new Set(array).size }
                if ((duplicate(slotsWinningRow)) && (getDuplicate(slotsWinningRow) !== "🍌")) {
                    const winnings = Math.ceil(args * payout[getDuplicate(slotsWinningRow)].semiJackpot)
                    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - args + winnings
                    const embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setDescription(slotMachine + '\n**-- YOU WON --**')
                        .addField('Profit', `**${winnings}** credits`, true)
                        .addField('Credits', `You now have ${receivedMessage.author.casino.balance} credits`, true)
                    updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance)
                    return receivedMessage.say(embed)
                }
                else {
                    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - args
                    const embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setDescription(slotMachine + '\n**-- YOU LOST --**')
                        .addField('Profit', `**-${args}** credits`, true)
                        .addField('Credits', `You now have ${receivedMessage.author.casino.balance} credits`, true)
                    updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance)
                    return receivedMessage.say(embed)
                }
            }
        }

    }
};



function getDuplicate(array) {
    if (array[0] === array[1] || array[0] === array[2]) {
        return array[0]
    }
    else {
        return array[1]
    }
}

async function updateBalanceDB(userId, balance) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Casino").updateOne({ userId: userId }, { $set: { balance: balance } }, { upsert: true });
        await client2.close();
    } catch (e) {
        console.error(`Slot update error. User: ${userId} Balance: ${balance}\n`, e)
    }
}