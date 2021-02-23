const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const casinoFunctions = require('../../util/casino');

module.exports = class rouletteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'roulette',
            aliases: ['rl'],
            group: 'casino',
            memberName: 'roulette',
            description: 'Bet on what number will be rolled in a game of American roulette.',
            examples: ['roulette', 'roulette <bet> <bet type>', 'roulette 100 black'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
        const acceptedGuesses = ['even', 'odd', 'black', 'red', '0', '00', '1-12', '13-24', '25-36', '1-18', '19-36', 'c1', 'c2', 'c3']
        const allNumbers = ['00', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]

        if (!receivedMessage.author.casino.setup && !await casinoFunctions.loadCasinoSettings(receivedMessage)) {
            return receivedMessage.say('You must first set up your casino account before using any casino commands. To do this, simply run the `casino-setup` command.')
        }
        else if (args.length == 0) {
            const embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle('Roulette')
                .setDescription('Bet on what number will be rolled.\n\n**__Bet Types__**\n- **Even**: 2, 4, 6, ..., 36\n- **Odd**: 1, 3, 5, ..., 35\n- **Black**: 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35\n- **Red**: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36\n- **1-12**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12\n- **13-24**: 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24\n- **25-36**: 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36\n- **c1**: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34\n- **c2**: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35\n- **c3**: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36\n- **00, 0, 1, ...., 36**\n\n**__Winnings__**\n\n**2x** - even/odd, black/red, 1-18/19-36\n**3x** - 1-12/13-24/25-36, c1/c2/c3\n**35x** - 00,0-36')
                .addField('Usage', 'roulette <bet> <bet type>', true)
                .addField('Examples', 'roulette 100 black\nroulette 100 1-12\nroulette 100 34', true)
                .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
            return receivedMessage.say(embed)
        }
        else if (!Number.isInteger(Number(args[0])) || (args[0] > receivedMessage.author.casino.balance) || (args[0] < 0)) {
            return receivedMessage.say('The amount you bet must be a valid integer below or equal to your current balance. To view your balance use the `credits` command.')
        }
        else if (!args[1]) {
            return receivedMessage.say('Your bet type was missing. To see the type of bets allowed, run the `roulette` command.')
        }
        else if (!acceptedGuesses.includes(args[1].toLowerCase()) && !allNumbers.includes(Number(args[1])) && args[1] != '00') {
            return receivedMessage.say('Your bet type was not valid. To see the type of bets allowed, run the `roulette` command.')
        }
        else {
            const roll = allNumbers[Math.floor(Math.random() * (allNumbers.length))]
            return playRoulette(receivedMessage, args[0], args[1].toLowerCase(), roll)
        }

    }
};

async function playRoulette(receivedMessage, bet, betType, roll) {
    const even = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
    const odd = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
    const black = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
    const red = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    const dozen1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const dozen2 = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
    const dozen3 = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
    const column1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
    const column2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
    const column3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]

    if (betType == 'even' && even.includes(roll)) return winner(receivedMessage, bet, betType, roll, 2)
    else if (betType == 'odd' && odd.includes(roll)) return winner(receivedMessage, bet, betType, roll, 2)
    else if (betType == 'black' && black.includes(roll)) return winner(receivedMessage, bet, betType, roll, 2)
    else if (betType == 'red' && red.includes(roll)) return winner(receivedMessage, bet, betType, roll, 2)
    else if (betType == '1-12' && dozen1.includes(roll)) return winner(receivedMessage, bet, betType, roll, 3)
    else if (betType == '13-24' && dozen2.includes(roll)) return winner(receivedMessage, bet, betType, roll, 3)
    else if (betType == '25-36' && dozen3.includes(roll)) return winner(receivedMessage, bet, betType, roll, 3)
    else if (betType == '1-18' && (roll >= 1 && roll <= 18)) return winner(receivedMessage, bet, betType, roll, 2)
    else if (betType == '19-36' && (roll >= 19 && roll <= 36)) return winner(receivedMessage, bet, betType, roll, 2)
    else if (betType == 'c1' && column1.includes(roll)) return winner(receivedMessage, bet, betType, roll, 3)
    else if (betType == 'c2' && column2.includes(roll)) return winner(receivedMessage, bet, betType, roll, 3)
    else if (betType == 'c3' && column3.includes(roll)) return winner(receivedMessage, bet, betType, roll, 3)
    else if ((betType == '00' && roll == '00') || (betType == '0' && roll == 0) || (Number(betType) == roll)) return winner(receivedMessage, bet, betType, roll, 35)
    else return loser(receivedMessage, bet, betType, roll)
}

async function winner(receivedMessage, bet, betType, roll, multiplier) {
    const winnings = bet * multiplier
    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - bet + winnings
    const embed = new Discord.MessageEmbed()
        .setColor('GREEN')
        .setTitle('Roulette')
        .addField('Correct!', `**Bet Type:** ${betType}\n**Number Rolled:** ${roll}`)
        .addField('Winnings', `**${winnings.toLocaleString()}** credits`, true)
        .addField('Credits', `You now have ${receivedMessage.author.casino.balance.toLocaleString()} credits`, true)
        .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
    casinoFunctions.updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance, 'Roulette')
    return receivedMessage.say(embed)
}

async function loser(receivedMessage, bet, betType, roll) {
    receivedMessage.author.casino.balance = receivedMessage.author.casino.balance - bet
    const embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle('Roulette')
        .addField('Incorrect!', `**Bet Type:** ${betType}\n**Number Rolled:** ${roll}`)
        .addField('Credits', `You now have ${receivedMessage.author.casino.balance.toLocaleString()} credits`)
        .setFooter(receivedMessage.author.tag, receivedMessage.author.displayAvatarURL())
    casinoFunctions.updateBalanceDB(receivedMessage.author.id, receivedMessage.author.casino.balance, 'Roulette')
    return receivedMessage.say(embed)
}
