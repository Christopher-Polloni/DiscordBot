const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')

module.exports = class tictactoeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'tictactoe',
            group: 'games',
            memberName: 'tictactoe',
            description: 'Play tictactoe with a user in same server.',
            examples: ['tictactoe <user>'],
            guildOnly: true,
            aliases: ['ttt']
        })
    }
    async run(receivedMessage) {
        if (receivedMessage.mentions.users.first() && receivedMessage.mentions.users.first().bot) {
            return receivedMessage.say(`Oops! Looks like a mistake was made. Here are some possible fixes.\n1. You must play against another user, not a bot.\n2. This command must use your server's prefix. Use \`@boop#9207 prefix\` if you aren't sure what the prefix is.`)
        }
        if (!receivedMessage.mentions.users.first()) {
            return receivedMessage.say(`You must mention the user you want to play with when using the \`tictactoe\` command.`)
        }

        let reactionFilter = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'];
        let row1 = ['⬜', '⬜', '⬜', '\n'];
        let row2 = ['⬜', '⬜', '⬜', '\n'];
        let row3 = ['⬜', '⬜', '⬜', '\n'];
        let board = [row1, row2, row3];

        let gameInfo = {
            receivedMessage: receivedMessage,
            board: board,
            reactionFilter: reactionFilter,
            currentTurn: '❌',
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
                    .setTitle('Tic Tac Toe')
                    .setDescription(displayBoard(gameInfo))
                    .addField('Player 1', `❌ ${gameInfo.users.user1}`, true)
                    .addField('Player 2', `⭕ ${gameInfo.users.user2}`, true)
                    .addField(`THE WINNER IS`, `Nobody! It's a tie!`)
                previousMessage.edit(embed)
                previousMessage.reactions.removeAll()
            })
    }
    else if (!gameInfo.messageId) {
        const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Tic Tac Toe')
            .setDescription(displayBoard(gameInfo))
            .addField('Player 1', `❌ ${gameInfo.users.user1}`, true)
            .addField('Player 2', `⭕ ${gameInfo.users.user2}`, true)
            .setFooter('Be sure to wait for all reactions to appear before selecting your choice.')

        if (gameInfo.currentTurn == '❌') {
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
        if (gameInfo.currentTurn == '❌') {
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

                if (reaction.emoji.name == '↖️') {
                    editBoard(gameInfo, '0', '0', '↖️')
                }
                else if (reaction.emoji.name == '⬆️') {
                    editBoard(gameInfo, '0', '1', '⬆️')
                }
                else if (reaction.emoji.name == '↗️') {
                    editBoard(gameInfo, '0', '2', '↗️')
                }
                else if (reaction.emoji.name == '⬅️') {
                    editBoard(gameInfo, '1', '0', '⬅️')
                }
                else if (reaction.emoji.name == '⏺️') {
                    editBoard(gameInfo, '1', '1', '⏺️')
                }
                else if (reaction.emoji.name == '➡️') {
                    editBoard(gameInfo, '1', '2', '➡️')
                }
                else if (reaction.emoji.name == '↙️') {
                    editBoard(gameInfo, '2', '0', '↙️')
                }
                else if (reaction.emoji.name == '⬇️') {
                    editBoard(gameInfo, '2', '1', '⬇️')
                }
                else {
                    editBoard(gameInfo, '2', '2', '↘️')
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
                    .setTitle('Tic Tac Toe')
                    .setDescription(displayBoard(gameInfo))
                    .addField('Player 1', `❌ ${gameInfo.users.user1}`, true)
                    .addField('Player 2', `⭕ ${gameInfo.users.user2}`, true)
                    .setFooter('Be sure to wait for all reactions to appear before selecting your choice.')

                if (gameInfo.currentTurn == '❌') {
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
                if (gameInfo.currentTurn == '❌') {
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

                        if (reaction.emoji.name == '↖️') {
                            editBoard(gameInfo, '0', '0', '↖️')
                        }
                        else if (reaction.emoji.name == '⬆️') {
                            editBoard(gameInfo, '0', '1', '⬆️')
                        }
                        else if (reaction.emoji.name == '↗️') {
                            editBoard(gameInfo, '0', '2', '↗️')
                        }
                        else if (reaction.emoji.name == '⬅️') {
                            editBoard(gameInfo, '1', '0', '⬅️')
                        }
                        else if (reaction.emoji.name == '⏺️') {
                            editBoard(gameInfo, '1', '1', '⏺️')
                        }
                        else if (reaction.emoji.name == '➡️') {
                            editBoard(gameInfo, '1', '2', '➡️')
                        }
                        else if (reaction.emoji.name == '↙️') {
                            editBoard(gameInfo, '2', '0', '↙️')
                        }
                        else if (reaction.emoji.name == '⬇️') {
                            editBoard(gameInfo, '2', '1', '⬇️')
                        }
                        else {
                            editBoard(gameInfo, '2', '2', '↘️')
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

function editBoard(gameInfo, row, column, emoji) {
    gameInfo.board[row][column] = gameInfo.currentTurn
    let indexOfPosition = gameInfo.reactionFilter.indexOf(emoji)
    gameInfo.reactionFilter.splice(indexOfPosition, 1)
    return checkWinner(gameInfo)
}

function checkWinner(gameInfo) {
    if (checkWinnerHorizontal(gameInfo) || checkWinnerVertical(gameInfo) || checkWinnerDiagonal(gameInfo)) {
        return announceWinner(gameInfo)
    }
    else {
        if (gameInfo.currentTurn == '❌') {
            gameInfo.currentTurn = '⭕'
        }
        else {
            gameInfo.currentTurn = '❌'
        }
        return game(gameInfo)
    }
}

function checkWinnerHorizontal(gameInfo) {
    let array = []
    for (let i = 0; i < 3; i++) {
        if (gameInfo.board[i][0] == '⬜') {
            continue
        }
        else {
            array.push(gameInfo.board[i][0], gameInfo.board[i][1], gameInfo.board[i][2])
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
    return false
}

function checkWinnerVertical(gameInfo) {
    let array = []
    for (let i = 0; i < 3; i++) {
        if (gameInfo.board[0][i] == '⬜') {
            continue
        }
        else {
            array.push(gameInfo.board[0][i], gameInfo.board[1][i], gameInfo.board[2][i])
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
    return false
}

function checkWinnerDiagonal(gameInfo) {
    let arrayDiagonalAscending = [gameInfo.board[2][0], gameInfo.board[1][1], gameInfo.board[0][2]]
    let arrayDiagonalDescending = [gameInfo.board[0][0], gameInfo.board[1][1], gameInfo.board[2][2]]

    if (gameInfo.board[1][1] == '⬜') {
        return false
    }
    else {
        const allEqual = arr => arr.every(val => val === arr[0]);
        const result1 = allEqual(arrayDiagonalAscending)
        const result2 = allEqual(arrayDiagonalAscending)
        if (result1 || result2) {
            return true
        }
        else {
            return false
        }
    }

}


function announceWinner(gameInfo) {
    gameInfo.receivedMessage.channel.messages.fetch(gameInfo.messageId)
        .then(previousMessage => {
            const embed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Tic Tac Toe')
                .setDescription(displayBoard(gameInfo))
                .addField('Player 1', `❌ ${gameInfo.users.user1}`, true)
                .addField('Player 2', `⭕ ${gameInfo.users.user2}`, true)
            if (gameInfo.currentTurn == '❌') {
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