const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))
const moment = require('moment');
const schedule = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'viewreminders',
      group: 'reminders',
      memberName: 'viewreminders',
      description: 'View your scheduled reminders',
      examples: ['$viewreminders'],
      guildOnly: false,
    })
  }
  async run(receivedMessage) {

    const author = receivedMessage.author.id.toString();
    console.log(author)
    viewReminders(receivedMessage, author);



  };

}


async function viewReminders(receivedMessage, author) {

  try {

    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    // Connect to the MongoDB cluster
    await client2.connect();

    let results = await client2.db("DiscordBot").collection("Personal Reminders")
      .find({ authorId: author })
      .sort({ date: 1 })
      .toArray()
    console.log(results)

    const embed = new Discord.MessageEmbed()
      .setColor('#0000FF')
      .setTitle("Upcoming Personal Reminders")
    for (let i = 0; i < 5; i++) {
      if (i < results.length) {
        let title = i + 1;
        let time = results[i].date;
        let id = results[i]._id;
        let reminder = results[i].reminder;
        let info = `Date: ${time.toLocaleString()} EDT\nID: ${id}\nReminder: ${reminder}`
        embed.addField(title, info)
        embed.setFooter(`Showing ${title}/${results.length} Reminders`)
      }
      else {
        break
      }
    }

    receivedMessage.author.send(embed);

  } catch (e) {
    console.error(e);
    receivedMessage.reply('There was an error uploading your reminder. Please try again')
  } finally {
    await client2.close();
  }

}
