const config = require('../config.js');
const casinoSchema = require('../schemas/casinoSchema');

exports.loadCasinoSettings = async (receivedMessage) => {
        let filter = {
            userId: receivedMessage.author.id
        }

        let result = await casinoSchema.find(filter)

        if (result.length == 0) {
            console.error(`Error fetching casino info from db. User: ${receivedMessage.author.id}`)
            return false
        }
        else {
            receivedMessage.author.casino.setup = true
            receivedMessage.author.casino.balance = result[0].balance || 0
            receivedMessage.author.casino.dailyCooldown = result[0].dailyCooldown || null
            receivedMessage.author.casino.voteCooldown = result[0].voteCooldown || null
            return true
        }

};

exports.updateBalanceDB = async (userId, balance, game) => {
    
    result = await casinoSchema.updateOne({ userId: userId }, { $set: { balance: balance } }, { upsert: true });

    if (!result) {
        console.error(`${game} update error. User: ${userId} Balance: ${balance}\n`)
    }
    
}