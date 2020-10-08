const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))
const moment = require('moment');
const schedule = require('node-schedule');
const MongoClient = require('mongodb').MongoClient;
const uri = config.mongoUri;
const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require('mongodb').ObjectID;

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'deletereminder',
      group: 'miscellaneous',
      memberName: 'deletereminder',
      description: 'Delete one of your reminders',
      examples: ['$viewreminders'],
      guildOnly: false,
    })
  }
  async run(receivedMessage, args) {

    const author = receivedMessage.author.id.toString();
    const id = args;
    console.log(id);
    // console.log(author)
    deleteReminder(receivedMessage, id, author);



  };

}


async function deleteReminder(receivedMessage, id, author) {

  try {
    const uri = config.mongoUri;
    const client2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    // Connect to the MongoDB cluster
    await client2.connect();

    let results = await client2.db("DiscordBot").collection("Personal Reminders")
      .find({"_id": ObjectId(id)})
      .toArray()
    console.log('Results');
    console.log(results);
    if (results.length == 0) {
      receivedMessage.author.send(`This reminder does not exist.`)
    }
    else if (results[0].authorId == author) {

      deletion = await client2.db("DiscordBot").collection("Personal Reminders")
        .deleteOne({"_id": ObjectId(id)});

      const embed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Reminder Deleted!')
        .setDescription('The following reminder has been deleted!')
        .addField('Scheduled For:', `${results[0].date.toLocaleString()} EDT`)
        .addField('Reminder:', results[0].reminder)
      receivedMessage.author.send(embed)

      const thisJob = 'reminder_' + id;
      console.log(thisJob);
      schedule.cancelJob(thisJob);

    }
    else {
      receivedMessage.author.send(`You must be the one who set the reminder in order to delete it.`)

    }

  } catch (e) {
    console.error(e);
    receivedMessage.reply('There was an error deleting your reminder. Please try again')
  } finally {
    await client2.close();
  }

}
