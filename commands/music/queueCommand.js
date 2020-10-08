const Commando = require('discord.js-commando');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))
const Discord = require('discord.js');

module.exports = class queueCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'music',
      memberName: 'queue',
      description: 'View list of songs in the queue',
      examples: ['\'$queue\''],
      guildOnly: true,
      argsType: 'multiple'
    })
  }
  run(receivedMessage, args) {
    const voiceChannel = receivedMessage.member.voice.channel;
    const queue = receivedMessage.guild.musicData.queue
    if (!voiceChannel) {
      return receivedMessage.reply('please join a voice channel first!');
    }
    else if (receivedMessage.guild.musicData.songDispatcher == null) {
      return receivedMessage.reply('there is no song playing right now and the queue is empty!');
    }
    else if (args.length == 0) {
      console.log(receivedMessage.guild.name)
      const videoEmbed = new Discord.MessageEmbed()
      .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
      .setTitle(`Queue for ${receivedMessage.guild.name}`)
      .setColor('#ff1500')
      .setTimestamp()
      for (let i = 0; i < 10; i++) {
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
      return receivedMessage.say(videoEmbed);
    }
  }
};
