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
      // console.log(receivedMessage.guild.name)
      const embed = new Discord.MessageEmbed()
      .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
      .setTitle(`Queue for ${receivedMessage.guild.name}`)
      .setColor('#ff1500')
      .setTimestamp()
      for (let i = 0; i < 11; i++) {
        if (i < queue.length) {
          if (i == 0){
            console.log(queue[0])
            embed.addField(`**Now Playing:**`, `[${queue[0].title}](${queue[0].videoLink})`)
            if (queue.length >= 2){
              embed.addField(`\u200b`, `**Up Next:**`)
            }
          }
          else{
            embed.addField(`${i}.`,`[${queue[i].title}](${queue[i].videoLink})`)
          }
          embed.setFooter(`Showing ${i+1}/${queue.length} Songs in Queue`)
        }
        else {
          break
        }
      }
      return receivedMessage.say(embed);
    }
  }
};
