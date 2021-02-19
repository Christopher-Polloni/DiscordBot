const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');

module.exports = class highLowCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'high-low',
            aliases: ['hl', 'h-l'],
            group: 'casino',
            memberName: 'high-low',
            description: 'Guess if the number generated is high or low (Low = 1 - 5, High = 6 - 10)',
            examples: ['high-low <bet> <high/low>', 'high-low 100 high', 'high-low 100 low'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
        const acceptedGuesses = ['high', 'h', 'low', 'l']
        if (!receivedMessage.author.casino.setup) {
            return receivedMessage.say('You must first set up your casino account before using any casino commands. To do this, simply run the `casino-setup` command.')
        }
        else if (args.length == 0) {
            const embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle('High-Low')
                .setDescription('Guess if the number generated is high or low.\nLow = 1 - 5\nHigh = 6 - 10')
                .addField('Usage', 'high-low <bet> <high/low>')
                .addField('Example', 'high-low 100 high')
                .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            return receivedMessage.say(embed)
        }
        else if (!Number.isInteger(Number(args[0])) || (args[0] > receivedMessage.author.casino.balance) || (args[0] < 0)) {
            return receivedMessage.say('The amount you bet must be a valid integer below or equal to your current balance. To view your balance use the `credits` command.')
        }
        else if (!acceptedGuesses.includes(args[1].toLowerCase())) {
            return receivedMessage.say('Your guess must be high/low, or h/l respectively. An example is `high-low 100 high`')
        }
        else {
            return continueGame(receivedMessage, args[0], args[1].toLowerCase(), 2)
        }

    }
};

async function continueGame(receivedMessage, bet, choice, multiplier) {

    if (choice == 'h' || choice == 'high') choice = 'High'
    if (choice == 'l' || choice == 'low') choice = 'Low'

    const number = Math.floor(Math.random() * (10)) + 1

    if ((number < 6 && choice == 'High') || (number > 5 && choice == 'Low')) {
        receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - bet
        const embed = new Discord.MessageEmbed()
            .setTitle('High-Low')
            .setColor('RED')
            .addField('Incorrect!', `**Guess:** ${choice}\n**Number:** ${number}`, true)
            .addField('Credits', `You now have ${receivedMessage.author.casino.balance.toLocaleString()} credits`)
            .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
        updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance)
        return receivedMessage.say(embed)
    }
    else {
        const embed = new Discord.MessageEmbed()
            .setTitle('High-Low')
            .setColor('GREEN')
            .addField('Correct!', `**Guess:** ${choice}\n**Number:** ${number}`, true)
            .addField('Multiplier', `**${multiplier}x**`, true)
            .addField('Continue', `Say **high** or **low** to guess again and increase the multiplier if you are correct.\nSay **stop** to end the game and collect your winnings.\nWinnings will be claimed if no response within 30 seconds.`)
            .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
        receivedMessage.say(embed)

        const acceptedResponses = ['high', 'h', 'low', 'l', 'stop', 's']
        const filter = m => receivedMessage.author.id === m.author.id && acceptedResponses.includes(m.content.toLowerCase())

        receivedMessage.channel.awaitMessages(filter, { time: 30000, max: 1, errors: ['time'] })
            .then(message => {
                if (message.first().content.toLowerCase() == 'h' || message.first().content.toLowerCase() == 'high') {
                    return continueGame(receivedMessage, bet, 'high', multiplier + 2)
                }
                else if (message.first().content.toLowerCase() == 'l' || message.first().content.toLowerCase() == 'low') {
                    return continueGame(receivedMessage, bet, 'low', multiplier + 2)
                }
                else {
                    const winnings = bet * multiplier
                    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - bet + winnings
                    const embed = new Discord.MessageEmbed()
                        .setTitle('High-Low')
                        .setColor('GREEN')
                        .addField('Stopped at', `**${multiplier}x**`, true)
                        .addField('Winnings', `**${winnings.toLocaleString()}** credits`, true)
                        .addField('Credits', `You now have ${receivedMessage.author.casino.balance.toLocaleString()} credits`)
                        .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                    updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance)
                    return receivedMessage.say(embed)
                }
            })
            .catch((e) => {
                console.error('High-low timed out waiting for response.', e);
                const winnings = bet * multiplier
                    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - bet + winnings
                    const embed = new Discord.MessageEmbed()
                        .setTitle('High-Low')
                        .setColor('GREEN')
                        .addField('Stopped at', `**${multiplier}x**`, true)
                        .addField('Winnings', `**${winnings.toLocaleString()}** credits`, true)
                        .addField('Credits', `You now have ${receivedMessage.author.casino.balance.toLocaleString()} credits`)
                        .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
                    updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance)
                    return receivedMessage.say(embed) 
            });
        return
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
        console.error(`High-Low update error. User: ${userId} Balance: ${balance}\n`, e)
    }
}