const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const schedule = require('node-schedule');
const paginationEmbed = require('discord.js-pagination');
const pollSchema = require('../../schemas/pollSchema');

module.exports = class cancelPollCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'cancel-poll',
            group: 'server poll',
            memberName: 'cancel-poll',
            description: 'Cancel the scheduled announcement of results for a server poll.',
            examples: ['cancel-poll <ID>'],
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, args) {
        try {

            let results = await pollSchema.find({ guildId: receivedMessage.guild.id}).sort({ date: 1 })
           
            if (results.length == 0){
                return receivedMessage.say(`There are not currently any active polls set for ${receivedMessage.guild.name}.`)
            }
            else {
                return viewPolls(receivedMessage, results);
            }
        } catch (e) {
            console.error(e);
            receivedMessage.say('There was an error retrieving the polls. Please try again.')
        }
    };
}

async function viewPolls(receivedMessage, scheduledPolls) {

        const numberPages = Math.ceil(scheduledPolls.length/3)

        let polls = []
        let pages = []
        for (let i = 0; i < scheduledPolls.length; i++) {
            polls.push(`**${i+1}.** [${scheduledPolls[i].question}](${scheduledPolls[i].messageUrl})\n**Result Date:** ${scheduledPolls[i].date.toLocaleString()} ${config.timeZone}\n`)
        }
        
        for (let i=0; i<numberPages; i++){
            let embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle('📊 Upcoming Poll Results')
            .setDescription(paginate(polls, 3, i))
            pages.push(embed)
        }

        paginationEmbed(receivedMessage, pages, ['◀️', '▶️'], 120000);
        selectPollToDelete(receivedMessage, scheduledPolls)
  }
  
  async function selectPollToDelete(receivedMessage, scheduledPolls) {
    receivedMessage.say(`Please enter the number of the poll you'd like to cancel the scheduled announcement of results for.`).then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;  
    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
        .then(messages => {
            if (!isNaN(messages.first().content) && messages.first().content > 0 && messages.first().content <= scheduledPolls.length) {
                return deletePoll(receivedMessage, scheduledPolls, messages.first().content-1)
            }
            else {
                receivedMessage.say('A valid reminder number was not provided.')
               return selectReminderToDelete(receivedMessage, scheduledPolls)
            }
        })
        .catch((e) => {
            console.log(e)
            return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `cancel-poll`");
        });
    });
  }
  
  async function deletePoll(receivedMessage, scheduledPolls, arrayPosition) {
    try {
    
        deletion = await pollSchema.deleteOne({ _id: scheduledPolls[arrayPosition]._id });

        const embed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('📊 Upcoming Poll Result Announcement Cancelled!')
            .setDescription(`[${scheduledPolls[0].question}](${scheduledPolls[0].messageUrl})`)
        receivedMessage.say(embed)

        const channel = receivedMessage.guild.channels.cache.find(ch => ch.id === scheduledPolls[0].channelId);
        const message = channel.messages.fetch(scheduledPolls[0].messageId).then(message => {
        const newEmbed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setDescription(scheduledPolls[0].pollOptions)
        message.edit(`📊 ${scheduledPolls[0].question}`, newEmbed)
        }).catch(console.error)
            
        const thisJob = 'poll_' + scheduledPolls[0]._id;
        schedule.cancelJob(thisJob);

    } catch (e) {
        console.error(e);
        receivedMessage.say('There was an error cancelling the automatic announcment of your poll results. Please try again')
    }
  }

  function paginate (array, page_size, page_number) {
    return array.slice(page_number * page_size, page_number * page_size + page_size).join('\n');
  };