const config = require('../config.js');

exports.loadCasinoSettings = async (receivedMessage) => {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        let filter = {
            userId: receivedMessage.author.id
        }

        let result = await client2.db("DiscordBot").collection("Casino")
            .find(filter)
            .toArray()

        await client2.close();

        if (!result) {
            return false
        }
        else {
            receivedMessage.author.casino.setup = true
            receivedMessage.author.casino.balance = result[0].balance || 0
            receivedMessage.author.casino.dailyCooldown = result[0].dailyCooldown || null
            receivedMessage.author.casino.voteCooldown = result[0].voteCooldown || null
            return true
        }
    } catch (e) {
        console.error(`Error fetching casino info from db. User: ${receivedMessage.author.id}`, e)
    }

};

exports.updateBalanceDB = async (userId, balance, game) => {
    const MongoClient = require('mongodb').MongoClient;
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client2.connect();
        result = await client2.db("DiscordBot").collection("Casino").updateOne({ userId: userId }, { $set: { balance: balance } }, { upsert: true });
        await client2.close();
    } catch (e) {
        console.error(`${game} update error. User: ${userId} Balance: ${balance}\n`, e)
    }
}