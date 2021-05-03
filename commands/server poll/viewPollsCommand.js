const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const schedule = require('node-schedule');
const paginationEmbed = require('discord.js-pagination');
const pollSchema = require('../../schemas/pollSchema');

module.exports = class viewPollsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'view-polls',
            group: 'server poll',
            memberName: 'view-polls',
            description: 'View any active polls in the server. This will only show polls that have a date for when the results will automatically be announced.',
            examples: [`view-polls`],
            guildOnly: true,
            argsType: 'single'
        })
    }
    async run(receivedMessage, args) {
        try {

            let results = await pollSchema.find( {guildId: receivedMessage.guild.id}).sort({ date: 1 })

            if (results.length == 0){
                return receivedMessage.say(`There are not currently any active polls set for ${receivedMessage.guild.name}.`)
            }

            const numberPages = Math.ceil(results.length/3)

            let polls = []
            let pages = []
            for (let i = 0; i < results.length; i++) {
                polls.push(`**${i+1}.** [${results[i].question}](${results[i].messageUrl})\n**Result Date:** ${results[i].date.toLocaleString()} ${config.timeZone}\n`)
            }
            
            for (let i=0; i<numberPages; i++){
                let embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle('📊 Upcoming Poll Results')
                .setDescription(paginate(polls, 3, i))
                pages.push(embed)
            }
    
            paginationEmbed(receivedMessage, pages, ['◀️', '▶️'], 120000);

        } catch (e) {
            console.error(e);
            receivedMessage.reply('There was an error retreiving your polls. Please try again')
        }
    }
};

function paginate (array, page_size, page_number) {
    return array.slice(page_number * page_size, page_number * page_size + page_size).join('\n');
  };