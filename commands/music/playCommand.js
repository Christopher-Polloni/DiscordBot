const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl')
const search = require('youtube-search');
const opts = {
  maxResults: 5,
  type: 'video',
  order: 'viewCount',
  q: "music|music video|official music video",
  key: config.youtubeAPI
};


module.exports = class playCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p'],
      group: 'music',
      memberName: 'play',
      description: 'Play a song in a voice channel.',
      examples: ['play <Youtube song link>', 'play <Youtube playlist link>', 'play <search terms for song>'],
      guildOnly: true,
      argsType: 'multiple'
    })
  }
  async run(receivedMessage, args) {
    const voiceChannel = receivedMessage.member.voice.channel;
    if (!voiceChannel) {
      return receivedMessage.reply(' please join a voice channel first!');
    }

    if (args.length == 0) {
      return receivedMessage.reply(' name a song or provide a Youtube link!')
    }
    else if (args.length == 1) {
      try {
        if (ytdl.validateURL(args[0]) || ytdl.validateID(args[0])) {
          var info = await ytdl.getInfo(args[0], { filter: 'audioonly' })
          const song = {
            "videoLink": args[0],
            "title": info.videoDetails.title,
            "songLength": info.videoDetails.lengthSeconds,
            "author": receivedMessage.author.username,
            "authorProfilePicture": receivedMessage.author.displayAvatarURL()
          }
          receivedMessage.guild.musicData.queue.push(song)
          if (receivedMessage.guild.musicData.isPlaying == false) {
            receivedMessage.guild.musicData.isPlaying = true;
            return playSong(receivedMessage.guild.musicData.queue);
          } else if (receivedMessage.guild.musicData.isPlaying == true) {
            return receivedMessage.say(
              `Playlist - :musical_note:  Your link :musical_note: has been added to queue`
            );
          }
        }
        else {
          const results = await ytpl(args[0]);
          let errorAddingToQueue = 0;
          const videoEmbed = new Discord.MessageEmbed()
            .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
            .setTitle(`:musical_note: Adding songs to the queue from the playlist ${results.title} :musical_note:`)
            .setColor('#fffb19')
            .setTimestamp()
          receivedMessage.say(videoEmbed)
          for (let i = 0; i < results.items.length; i++) {
            try {
              var info = await ytdl.getInfo(results.items[i].url, { filter: 'audioonly' })
              const song = {
                "videoLink": results.items[i].url,
                "title": info.videoDetails.title,
                "songLength": info.videoDetails.lengthSeconds,
                "author": receivedMessage.author.username,
                "authorProfilePicture": receivedMessage.author.displayAvatarURL()
              }
              receivedMessage.guild.musicData.queue.push(song)
              if (receivedMessage.guild.musicData.isPlaying == false) {
                receivedMessage.guild.musicData.isPlaying = true;
                playSong(receivedMessage.guild.musicData.queue);
              }
            }
            catch (err) {
              console.error(err)
              errorAddingToQueue++;
            }
          }
          const videoEmbed2 = new Discord.MessageEmbed()
            .setAuthor(receivedMessage.author.username, receivedMessage.author.displayAvatarURL())
            .setTitle(`:musical_note: Successfully added ${results.items.length - errorAddingToQueue}/${results.items.length} songs to the queue from the playlist ${results.title} :musical_note:`)
            .setColor('#fffb19')
            .setTimestamp()
          receivedMessage.say(videoEmbed2)
        }
      } catch (err) {
        console.error(err);
        receivedMessage.say('Song/Playlist is either private or it does not exist');
      }
    }

    else {
      var searchThis = args.join(' ');
      search(searchThis, opts, function (err, results) {
        if (err) return console.log(err);
        var userAvatarUrl = receivedMessage.author.displayAvatarURL();
        sendEmbed(results, userAvatarUrl)
      });
    }
    async function sendEmbed(results, userAvatarUrl) {
      const embed = new Discord.MessageEmbed()
        .setColor('#ff1500')
        .setTitle("Select a Song!")
        .setAuthor(receivedMessage.author.username, userAvatarUrl)
        .addFields(
          { name: 'Option 1', value: `**Title: ${results[0].title}**\nChannel: ${results[0].channelTitle}` },
          { name: 'Option 2', value: `**Title: ${results[1].title}**\nChannel: ${results[1].channelTitle}` },
          { name: 'Option 3', value: `**Title: ${results[2].title}**\nChannel: ${results[2].channelTitle}` },
          { name: 'Option 4', value: `**Title: ${results[3].title}**\nChannel: ${results[3].channelTitle}` },
          { name: 'Option 5', value: `**Title: ${results[4].title}**\nChannel: ${results[4].channelTitle}` }
        )
        .setTimestamp()
      let confirm = await receivedMessage.channel.send(embed)
      await confirm.react('1️⃣');
      await confirm.react('2️⃣');
      await confirm.react('3️⃣');
      await confirm.react('4️⃣');
      await confirm.react('5️⃣');

      const filter = (reaction, user) => {
        return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && user.id === receivedMessage.author.id;
      };

      confirm.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(collected => {
          const reaction = collected.first();

          if (reaction.emoji.name == '1️⃣') {
            var i = 0;
            playSelection(results[i].link)
          }
          else if (reaction.emoji.name == '2️⃣') {
            var i = 1;
            playSelection(results[i].link)
          }
          else if (reaction.emoji.name == '3️⃣') {
            var i = 2;
            playSelection(results[i].link)
          }
          else if (reaction.emoji.name == '4️⃣') {
            var i = 3;
            playSelection(results[i].link)
          }
          else {
            var i = 4;
            playSelection(results[i].link)
          }
        })
        .catch(collected => {
          receivedMessage.reply('you didn\'t react with an emoji');
        });

    };

    async function playSelection(url) {
      // console.log(url)
      var info = await ytdl.getInfo(url, { filter: 'audioonly' })
      const song = {
        "videoLink": url,
        "title": info.videoDetails.title,
        "songLength": info.videoDetails.lengthSeconds,
        "author": receivedMessage.author.username,
        "authorProfilePicture": receivedMessage.author.displayAvatarURL()
      }
      receivedMessage.guild.musicData.queue.push(song)
      if (receivedMessage.guild.musicData.isPlaying == false) {
        receivedMessage.guild.musicData.isPlaying = true;
        return playSong(receivedMessage.guild.musicData.queue);
      }
      else if (receivedMessage.guild.musicData.isPlaying == true) {
        const videoEmbed = new Discord.MessageEmbed(song)
          .setAuthor(song.author, song.authorProfilePicture)
          .setTitle(`:musical_note: ${song.title} :musical_note: has been added to queue`)
          .setColor('#fffb19')
          .setTimestamp()
        return receivedMessage.say(videoEmbed);
      }
    };

    async function playSong(queue) {
      voiceChannel.join().then(connection => {
        const dispatcher = connection
          .play(
            ytdl(queue[0].videoLink, {
              quality: 'highestaudio',
              highWaterMark: 1024 * 1024 * 10
            })
          )
          .on('start', () => {
            receivedMessage.guild.musicData.songDispatcher = dispatcher;
            dispatcher.setVolume(receivedMessage.guild.musicData.volume);
            const videoEmbed = new Discord.MessageEmbed()
              .setAuthor(queue[0].author, queue[0].authorProfilePicture)
              .setThumbnail(queue[0].thumbnail)
              .setColor('#2c7a26')
              .addField('Now Playing:', queue[0].title)
              .setURL(queue[0].link)
              .addField('Duration:', getSongDuration(queue[0].songLength))
              .setTimestamp()
            if (queue[1]) videoEmbed.addField('Next Song:', queue[1].title);
            return receivedMessage.say(videoEmbed);
          })
          .on('finish', () => {
            // this event fires when the song has ended
            queue.shift()
            if (queue.length > 0) {
              return playSong(queue);
            } else {
              receivedMessage.guild.musicData.isPlaying = false;
              return voiceChannel.leave();
            }
          })
          .on('error', e => {
            console.error(e);
            if (queue.length > 0) {
              queue.shift();
              return playSong(queue);
            } else {
              receivedMessage.guild.musicData.isPlaying = false;
              return voiceChannel.leave();
            }
          });
      })
    };

    function getSongDuration(songLength) {
      let seconds = Number(songLength);

      let date = new Date(seconds * 1000);
      let hh = date.getUTCHours();
      let mm = date.getUTCMinutes();
      let ss = date.getSeconds();

      if (seconds > 86399) {
        let t = "Duration is longer than 24 hours"
        return t;
      }
      else if (hh == "00") {
        if (ss < 10) {
          ss = "0" + ss;
        }
        let t = `${mm}:${ss}`;
        return t;
      }
      else {
        if (mm < 10) {
          mm = "0" + mm;
        }
        if (ss < 10) {
          ss = "0" + ss;
        }
        let t = `${hh}:${mm}:${ss}`
        return t;
      }
    }

  }
};
