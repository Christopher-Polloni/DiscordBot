const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const { runInThisContext } = require('vm');
const request = require('request');
const cheerio = require('cheerio')
const schedule = require('node-schedule');

module.exports = class checkCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'check',
            group: 'miscellaneous',
            memberName: 'check',
            description: '',
            examples: ['check'],
            guildOnly: false,
            ownerOnly: true
        })
    }
    async run(receivedMessage, arg) {    
        const rule = new schedule.RecurrenceRule();
        rule.minute = [0,15,30,45];
         
        const j = schedule.scheduleJob(rule, function(){
            const local_stores = {
                "Long Island, NY": 156,
                "Brooklyn, NY": 921,
                "New Haven, CT": 213,
                "Elizabeth, NJ": 154,
                "Paramus, NJ": 409,
                "Baltimore, MD": 152,
                "Philadelphia, PA": 215
            }
            const region = 'us'
            const locale = 'en'
            const item_name = "Besta Shelf - black/brown"
            const item_id = '40295528'
            const availability_url = `http://www.ikea.com/${region}/${locale}/iows/catalog/availability/${item_id}`
            let storeResponses = []

            request(availability_url, function (error, response, body) {
                for (let x in local_stores) {
                    const $ = cheerio.load(body);
                    let stockCount = $('availability > localStore[buCode="' + local_stores[x] + '"] > stock > availableStock').text();
            
                    storeResponses.push(`${stockCount} item(s) in stock at ${x}\n-------------------------------------------\n`)
                }
                let description = ''
                const embed = new Discord.MessageEmbed()
                .setTitle(`IKEA Availability Checker`)
                .setTimestamp()

                for (let x in storeResponses){
                    description = description.concat(storeResponses[x])
                }
                embed.setDescription(description)
                
                receivedMessage.say(embed)
                
            });
        });
    }
};
