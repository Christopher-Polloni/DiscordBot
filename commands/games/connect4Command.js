const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')

module.exports = class connect4Command extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'connect4',
            group: 'games',
            memberName: 'connect4',
            description: 'Play Connect 4 with a user in same server',
            examples: ['connect4 <user>'],
            guildOnly: true,
        })
    }
    async run(receivedMessage) {
        if (receivedMessage.mentions.users.first() && receivedMessage.mentions.users.first().bot) {
            return receivedMessage.say(`Oops! Looks like a mistake was made. Here are some possible fixes.\n1. You must play against another user, not a bot.\n2. This command must use your server's prefix. Use \`@boop#9207 prefix\` if you aren't sure what the prefix is.`)
        }
        if (!receivedMessage.mentions.users.first()) {
            return receivedMessage.say(`You must mention the user you want to play with when using the \`connect4\` command.`)
        }

        let columnDisplay = `1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣`;
        let reactionFilter = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];
        let row1 = ['⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '\n'];
        let row2 = ['⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '\n'];
        let row3 = ['⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '\n'];
        let row4 = ['⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '\n'];
        let row5 = ['⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '\n'];
        let row6 = ['⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '⚪', '\n'];
        let board = [row1, row2, row3, row4, row5, row6];

        let gameInfo = {
            receivedMessage: receivedMessage,
            columnDisplay: columnDisplay,
            board: board,
            reactionFilter: reactionFilter,
            currentTurn: '🔴',
            users: {
                user1: receivedMessage.author,
                user2: receivedMessage.mentions.users.first()
            },
            messageId: null
        }
        return game(gameInfo)
    }
};

async function game(gameInfo) {

    if (gameInfo.reactionFilter.length == 0) {
        gameInfo.receivedMessage.channel.messages.fetch(gameInfo.messageId)
            .then(previousMessage => {
                const embed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Connect 4')
                    .setDescription(`${gameInfo.columnDisplay}\n` + displayBoard(gameInfo))
                    .addField('Player 1', `🔴 ${gameInfo.users.user1}`, true)
                    .addField('Player 2', `🟡 ${gameInfo.users.user2}`, true)
                    .addField(`THE WINNER IS`, `Nobody! It's a tie!`)
                previousMessage.edit(embed)
                previousMessage.reactions.removeAll()
            })
    }
    else if (!gameInfo.messageId) {
        const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Connect 4')
            .setDescription(`${gameInfo.columnDisplay}\n` + displayBoard(gameInfo))
            .addField('Player 1', `🔴 ${gameInfo.users.user1}`, true)
            .addField('Player 2', `🟡 ${gameInfo.users.user2}`, true)
            .setFooter('Be sure to wait for all reactions to appear before selecting your choice.')

        if (gameInfo.currentTurn == '🔴') {
            embed.addField('Your Turn:', `${gameInfo.users.user1}`)
        }
        else {
            embed.addField('Your Turn:', `${gameInfo.users.user2}`)
        }
        let msg = await gameInfo.receivedMessage.say(embed)
        gameInfo.messageId = msg.id
        for (let i = 0; i < gameInfo.reactionFilter.length; i++) {
            await msg.react(gameInfo.reactionFilter[i]);
        }

        let abc = '';
        if (gameInfo.currentTurn == '🔴') {
            abc = gameInfo.users.user1.id
        }
        else {
            abc = gameInfo.users.user2.id
        }

        const filter = (reaction, user) => {
            return gameInfo.reactionFilter.includes(reaction.emoji.name) && user.id === abc;
        };

        msg.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name == '1️⃣') {
                    editBoard(gameInfo, '0', '1️⃣')
                }
                else if (reaction.emoji.name == '2️⃣') {
                    editBoard(gameInfo, '1', '2️⃣')
                }
                else if (reaction.emoji.name == '3️⃣') {
                    editBoard(gameInfo, '2', '3️⃣')
                }
                else if (reaction.emoji.name == '4️⃣') {
                    editBoard(gameInfo, '3', '4️⃣')
                }
                else if (reaction.emoji.name == '5️⃣') {
                    editBoard(gameInfo, '4', '5️⃣')
                }
                else if (reaction.emoji.name == '6️⃣') {
                    editBoard(gameInfo, '5', '6️⃣')
                }
                else {
                    editBoard(gameInfo, '6', '7️⃣')
                }
            })
            .catch(collected => {
                gameInfo.receivedMessage.say('Two minutes passed without a selection, this game is now over!');
                console.log(collected)
            });
    }
    else {
        gameInfo.receivedMessage.channel.messages.fetch(gameInfo.messageId)
            .then(async previousMessage => {
                const embed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Connect 4')
                    .setDescription(`${gameInfo.columnDisplay}\n` + displayBoard(gameInfo))
                    .addField('Player 1', `🔴 ${gameInfo.users.user1}`, true)
                    .addField('Player 2', `🟡 ${gameInfo.users.user2}`, true)
                    .setFooter('Be sure to wait for all reactions to appear before selecting your choice.')

                if (gameInfo.currentTurn == '🔴') {
                    embed.addField('Your Turn:', `${gameInfo.users.user1}`)
                }
                else {
                    embed.addField('Your Turn:', `${gameInfo.users.user2}`)
                }
                let msg = await previousMessage.edit(embed)
                gameInfo.messageId = msg.id
                const user1Reactions = previousMessage.reactions.cache.filter(reaction => reaction.users.cache.has(gameInfo.users.user1.id));
                try {
                    for (const reaction of user1Reactions.values()) {
                        await reaction.users.remove(gameInfo.users.user1.id);
                    }
                } catch (error) {
                    console.error(error);
                }
                const user2Reactions = previousMessage.reactions.cache.filter(reaction => reaction.users.cache.has(gameInfo.users.user2.id));
                try {
                    for (const reaction of user2Reactions.values()) {
                        await reaction.users.remove(gameInfo.users.user2.id);
                    }
                } catch (error) {
                    console.error(error);
                }

                let abc = '';
                if (gameInfo.currentTurn == '🔴') {
                    abc = gameInfo.users.user1.id
                }
                else {
                    abc = gameInfo.users.user2.id
                }

                const filter = (reaction, user) => {
                    return gameInfo.reactionFilter.includes(reaction.emoji.name) && user.id === abc;
                };

                msg.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();

                        if (reaction.emoji.name == '1️⃣') {
                            editBoard(gameInfo, '0', '1️⃣')
                        }
                        else if (reaction.emoji.name == '2️⃣') {
                            editBoard(gameInfo, '1', '2️⃣')
                        }
                        else if (reaction.emoji.name == '3️⃣') {
                            editBoard(gameInfo, '2', '3️⃣')
                        }
                        else if (reaction.emoji.name == '4️⃣') {
                            editBoard(gameInfo, '3', '4️⃣')
                        }
                        else if (reaction.emoji.name == '5️⃣') {
                            editBoard(gameInfo, '4', '5️⃣')
                        }
                        else if (reaction.emoji.name == '6️⃣') {
                            editBoard(gameInfo, '5', '6️⃣')
                        }
                        else {
                            editBoard(gameInfo, '6', '7️⃣')
                        }
                    })
                    .catch(collected => {
                        gameInfo.receivedMessage.say('Two minutes passed without a selection, this game is now over!');
                        console.log(collected)
                    });
            });
    }
}

function displayBoard(gameInfo) {
    let boardDisplay = ``;
    for (let i = 0; i < gameInfo.board.length; i++) {
        for (let j = 0; j < gameInfo.board[i].length; j++) {
            boardDisplay = boardDisplay.concat(gameInfo.board[i][j])
        }
    }
    return boardDisplay
}

function editBoard(gameInfo, column, emoji) {
    for (let i = 5; i >= 0; i--) {
        if (gameInfo.board[i][column] == '⚪') {
            gameInfo.board[i][column] = gameInfo.currentTurn
            if (i == 0) {
                let indexOfColumn = gameInfo.reactionFilter.indexOf(emoji)
                gameInfo.reactionFilter.splice(indexOfColumn, 1)
            }
            break
        }
    }
    return checkWinner(gameInfo)
}

function checkWinner(gameInfo) {
    if (checkWinnerHorizontal(gameInfo) || checkWinnerVertical(gameInfo) || checkWinnerDiagonalAscending(gameInfo) || checkWinnerDiagonalDescending(gameInfo)) {
        return announceWinner(gameInfo)
    }
    else {
        if (gameInfo.currentTurn == '🔴') {
            gameInfo.currentTurn = '🟡'
        }
        else {
            gameInfo.currentTurn = '🔴'
        }
        return game(gameInfo)
    }
}

function checkWinnerHorizontal(gameInfo) {
    let array = []
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
            if (gameInfo.board[i][j] == '⚪') {
                continue
            }
            else {
                array.push(gameInfo.board[i][j], gameInfo.board[i][j + 1], gameInfo.board[i][j + 2], gameInfo.board[i][j + 3])
                const allEqual = arr => arr.every(val => val === arr[0]);
                const result = allEqual(array)
                if (result) {
                    return true
                }
                else {
                    array = []
                }
            }
        }
    }
    return false
}

function checkWinnerVertical(gameInfo) {
    let array = []
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 7; j++) {
            if (gameInfo.board[i][j] == '⚪') {
                continue
            }
            else {
                array.push(gameInfo.board[i][j], gameInfo.board[i + 1][j], gameInfo.board[i + 2][j], gameInfo.board[i + 3][j])
                const allEqual = arr => arr.every(val => val === arr[0]);
                const result = allEqual(array)
                if (result) {
                    console.log(result)
                    return true
                }
                else {
                    array = []
                }
            }
        }
    }
    return false
}

function checkWinnerDiagonalAscending(gameInfo) {
    let array = []
    for (let i = 3; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
            if (gameInfo.board[i][j] == '⚪') {
                continue
            }
            else {
                array.push(gameInfo.board[i][j], gameInfo.board[i - 1][j + 1], gameInfo.board[i - 2][j + 2], gameInfo.board[i - 3][j + 3])
                const allEqual = arr => arr.every(val => val === arr[0]);
                const result = allEqual(array)
                if (result) {
                    console.log(result)
                    return true
                }
                else {
                    array = []
                }
            }
        }
    }
    return false
}

function checkWinnerDiagonalDescending(gameInfo) {
    let array = []
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            if (gameInfo.board[i][j] == '⚪') {
                continue
            }
            else {
                array.push(gameInfo.board[i][j], gameInfo.board[i + 1][j + 1], gameInfo.board[i + 2][j + 2], gameInfo.board[i + 3][j + 3])
                const allEqual = arr => arr.every(val => val === arr[0]);
                const result = allEqual(array)
                if (result) {
                    console.log(result)
                    return true
                }
                else {
                    array = []
                }
            }
        }
    }
    return false
}

function announceWinner(gameInfo) {
    gameInfo.receivedMessage.channel.messages.fetch(gameInfo.messageId)
        .then(previousMessage => {
            const embed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Connect 4')
                .setDescription(`${gameInfo.columnDisplay}\n` + displayBoard(gameInfo))
                .addField('Player 1', `🔴 ${gameInfo.users.user1}`, true)
                .addField('Player 2', `🟡 ${gameInfo.users.user2}`, true)
            if (gameInfo.currentTurn == '🔴') {
                embed.addField(`THE WINNER IS`, `🎉🎉🎉${gameInfo.users.user1}🎉🎉🎉`)
            }
            else {
                embed.addField(`THE WINNER IS`, `🎉🎉🎉${gameInfo.users.user2}🎉🎉🎉`)
            }
            previousMessage.edit(embed)
            previousMessage.reactions.removeAll()
            return
        });
}