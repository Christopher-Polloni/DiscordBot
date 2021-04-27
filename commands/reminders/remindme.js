const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const config = require('../../config.js');
const moment = require('moment');
const schedule = require('node-schedule');
const personalRemindersSchema = require('../../schemas/personalRemindersSchema');

module.exports = class scheduleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'remind-me',
      group: 'reminders',
      memberName: 'remind-me',
      description: 'Schedule a reminder.',
      examples: ['remind-me'],
      guildOnly: false,
      argsType: 'multiple'
    })
  }
  async run(receivedMessage) {

    getDate(receivedMessage);
    
  };

}


async function getDate(receivedMessage) {
  if (receivedMessage.channel.type !== 'dm') {
    receivedMessage.say(`Check your DM to continue creating your reminder.`)
  }
  receivedMessage.author.send("Please enter the day for your reminder using the format 'MM/DD/YY'.").then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
      .then(messages => {

        const dateInput = messages.first().content.split("/");
        const yearEnd = dateInput[2];
        const yearStart = '20';
        const year = yearStart.concat(yearEnd)
        if (year !== "2020" && year !== "2021") {
          return receivedMessage.author.send('Currently reminders can only be made through the end of 2021.');
        }
        const month = dateInput[0] - 1;
        const day = dateInput[1];

        if (!moment([year, month, day]).isValid()){
          receivedMessage.author.send('The date for this reminder is not valid.')
          return getDate(receivedMessage);
        }

        const date = new Date(year, month, day, 23, 59, 59);

        const difference = date - new Date();
        if (difference <= 0) {
          return receivedMessage.author.send('The date for this reminder has already passed!');
        }

        return getTime(receivedMessage, month, day, year);
      })
      .catch((e) => {
        console.error(e);
        newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `remindme`");
      });
  });

}

async function getTime(receivedMessage, month, day, year) {

  receivedMessage.author.send("Please enter the time for your reminder using the format 'hh:mm AM' or 'hh:mm PM'").then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
      .then(messages => {

        const completeTime = messages.first().content.split(" ");
        const timeOfDay = completeTime[1];
        const timeOfDayAccepted = ["am", "a.m.", "pm", "p.m."];
        const possibleHours = ["1","2","3","4","5","6","7","8","9","10","11","12"];
        const militaryHours = ["0","13","14","15","16","17","18","19","20","21","22","23"];
        const time = completeTime[0].split(':');
        let hours = time[0];
        const minutes = time[1];

        if (timeOfDayAccepted.includes(timeOfDay.toLowerCase())) {
          if (timeOfDay.toLowerCase() == 'am' || timeOfDay.toLowerCase() == 'a.m.'){
            if (hours == '12'){
              hours = 0;
            }
            else if (hours !== '12' && possibleHours.includes(hours)){
              hours = hours;
            }
            else if (militaryHours.includes(hours)){
              receivedMessage.author.send('Military time is not supported.');
              return getTime(receivedMessage, month, day, year);
            }
            else {
              receivedMessage.author.send('There was an error with the time you input.');
              return getTime(receivedMessage, month, day, year);
            }

          }
          else{ 
            if (hours == '12'){
              hours = hours;
            }
            else if (hours !== '12' && possibleHours.includes(hours)){
              hours = Number(hours) + 12;
            }
            else if (militaryHours.includes(hours)){
              receivedMessage.author.send('Military time is not supported.');
              return getTime(receivedMessage, month, day, year);
            }
            else {
              receivedMessage.author.send('There was an error with the time you input.');
              return getTime(receivedMessage, month, day, year);
            }
          }
        }
        else {
          receivedMessage.author.send('AM/PM not recognized');
          return getTime(receivedMessage, month, day, year);
        }

        if (!moment([year, month, day, hours, minutes]).isValid()){
          receivedMessage.author.send('The time for this reminder is not valid.')
          return getTime(receivedMessage, year, month, day);
        }

        const date = new Date(year, month, day, hours, minutes, 00);
        const difference = date - new Date();
        if (difference <= 0) {
          return receivedMessage.author.send('The date and time for this reminder has already passed!')
        }
        else {
          getReminder(receivedMessage, date);

        }

      })
      .catch((e) => {
        console.log(e)
        return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `remindme`");
      });
  });

}

async function getReminder(receivedMessage, date) {

  receivedMessage.author.send("Please enter message for your reminder.").then((newmsg) => {
    const filter = m => receivedMessage.author.id === m.author.id;

    newmsg.channel.awaitMessages(filter, { time: 600000, max: 1, errors: ['time'] })
      .then(messages => {

        const reminder = messages.first().content;
        
        return createNewReminder(
          {
            userId: receivedMessage.author.id,
            date: date,
            reminder: reminder
          },
          receivedMessage
        )

      })
      .catch((e) => {
        console.log(e)
        return newmsg.channel.send("Too much time has elapsed! You'll need to restart the command with `remindme`");
      });
  });

}


async function createNewReminder(newReminder, receivedMessage) {

  try {
    let result = await personalRemindersSchema.create(newReminder);
    const embed = new Discord.MessageEmbed()
      .setColor('#FFFF00')
      .setTitle('Reminder Set!')
      .addField('Scheduled For:', `${newReminder.date.toLocaleString()} ${config.timeZone}`)
      .addField('Reminder:', newReminder.reminder)
    receivedMessage.author.send(embed)

    schedule.scheduleJob('reminder_' + result._id, newReminder.date, async function () {
      const embed = new Discord.MessageEmbed()
        .setColor('#4cbb17')
        .setTitle('🚨Reminder🚨')
        .setDescription(`${newReminder.date.toLocaleString()} ${config.timeZone}`)
        .addField('Reminder:', newReminder.reminder)
      receivedMessage.author.send(embed)

      deletion = await personalRemindersSchema.deleteOne({ _id: result._id });
    });
  } catch (e) {
    console.error(e);
    receivedMessage.author.send('There was an error uploading your reminder. Please try again')
  }
}
