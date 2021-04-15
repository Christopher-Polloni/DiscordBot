const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const paginationEmbed = require('discord.js-pagination');
const commandLeaderboardSchema = require('../../schemas/commandUsesSchema')

module.exports = class commandsLeaderboardCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'command-leaderboard',
            aliases: ['commands-leaderboard', 'top-used-commands'],
            group: 'util',
            memberName: 'commands-leaderboard',
            description: 'See which commands are used the most!',
            examples: [`commands-leaderboard`],
            guildOnly: false,
        })
    }
    async run(receivedMessage) {

        
        let result = await commandLeaderboardSchema.find().sort({ numberOfUses: -1 })

        let leaderboard = []
        for (let i=0; i<result.length; i++){
            leaderboard.push(`**${i+1}.** ${result[i].commandName} • ${result[i].numberOfUses} Uses`)
        }

        const numberPages = Math.ceil(result.length/10)
        
        let pages = []
        for (let i=0; i<numberPages; i++){
            let embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle('Most Used Commands')
            .setDescription(paginate(leaderboard, 10, i))
            pages.push(embed)
        }


        paginationEmbed(receivedMessage, pages, ['◀️', '▶️'], 120000);
    }

    
};


function paginate (array, page_size, page_number) {
    return array.slice(page_number * page_size, page_number * page_size + page_size).join('\n');
  };