const Commando = require('discord.js-commando');
const path = require('path');
const config = require(path.join(__dirname, '../../config', 'config.json'))
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const search = require('youtube-search');
const timeFormat = require('hh-mm-ss');
const opts = {
  maxResults: 5,
  type: 'video',
  order: 'viewCount',
  q: "music|music video|official music video",
  key: config.youtubeAPI
};


module.exports = class playCommand extends Commando.Command{
  constructor(client){
    super(client, {
      name : 'play',
      group : 'music',
      memberName : 'play',
      description : 'Play a song in a voice channel',
      examples: ['\'$play <Youtube link>\', \'$play <search term for song>\''],
      guildOnly: true,
      argsType: 'multiple'
    })
  }
  async run (receivedMessage, args) {
    const voiceChannel = receivedMessage.member.voice.channel;
    if (!voiceChannel) {
      return receivedMessage.reply(' please join a voice channel first!');
    }

    if (args.length == 0){
      return receivedMessage.reply(' name a song or provide a Youtube link!')
    }
    else if (args.length == 1){
      try{
        if (ytdl.validateURL(args[0]) || ytdl.validateID(args[0])){
          var user_id = receivedMessage.author.id
          var user_avatar = receivedMessage.author.avatar
          var info = await ytdl.getInfo(args[0], { filter: 'audioonly'})
          const song = {
            "videoLink": args[0],
            "title": info.videoDetails.title,
            // "title": info.title,
            "songLength": info.videoDetails.lengthSeconds,
            // "songLength": info.length_seconds,
            "author": receivedMessage.author.username,
            "authorProfilePicture": `https://cdn.discordapp.com/avatars/${user_id}/${user_avatar}.png`
          }
          receivedMessage.guild.musicData.queue.push(song)
          console.log(receivedMessage.guild.musicData.queue)
          if (receivedMessage.guild.musicData.isPlaying == false) { // if nothing is playing
            receivedMessage.guild.musicData.isPlaying = true;
            return playSong(receivedMessage.guild.musicData.queue); // play the playlist
          } else if (receivedMessage.guild.musicData.isPlaying == true) { // if something is already playing
            return receivedMessage.say(
              `Playlist - :musical_note:  Your link :musical_note: has been added to queue`
            );
          }
        }
      } catch (err) {
        console.error(err);
        return message.say('Playlist is either private or it does not exist');
      }
    }

    else{
      var searchThis = args.join(' ');
      search(searchThis, opts, function(err, results) {
        if(err) return console.log(err);
        console.log(results)
        var user_id = receivedMessage.author.id
        var user_avatar = receivedMessage.author.avatar
        var userAvatarUrl = 'https://cdn.discordapp.com/avatars/'+user_id+'/'+user_avatar+'.png'
        sendEmbed(results, userAvatarUrl)
      });
    }
    async function sendEmbed(results,userAvatarUrl){
      const embed = new Discord.MessageEmbed()
      .setColor('#ff1500')
      .setTitle("Select a Song!")
      // .setURL(results[0].link)
      .setAuthor(receivedMessage.author.username, userAvatarUrl)
      .addFields(
        { name: 'Option 1', value: `**Title: ${results[0].title}**\nChannel: ${results[0].channelTitle}` },
        { name: 'Option 2', value: `**Title: ${results[1].title}**\nChannel: ${results[1].channelTitle}` },
        { name: 'Option 3', value: `**Title: ${results[2].title}**\nChannel: ${results[2].channelTitle}` },
        { name: 'Option 4', value: `**Title: ${results[3].title}**\nChannel: ${results[3].channelTitle}` },
        { name: 'Option 5', value: `**Title: ${results[4].title}**\nChannel: ${results[4].channelTitle}` }
      )
      // .setImage(results[0].thumbnails.default.url)
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
          receivedMessage.reply('you reacted with 1');
          var i=0;
          playSelection(results[i].link)
        }
        else if (reaction.emoji.name == '2️⃣') {
          receivedMessage.reply('you reacted with 2');
          var i=1;
          playSelection(results[i].link)
        }
        else if (reaction.emoji.name == '3️⃣') {
          receivedMessage.reply('you reacted with 3');
          var i=2;
          playSelection(results[i].link)
        }
        else if (reaction.emoji.name == '4️⃣') {
          receivedMessage.reply('you reacted with 4');
          var i=3;
          playSelection(results[i].link)
        }
        else {
          receivedMessage.reply('you reacted with 5');
          var i=4;
          playSelection(results[i].link)
        }
      })
      .catch(collected => {
        receivedMessage.reply('you didn\'t react with an emoji');
      });

    };

    async function playSelection(url){
      console.log(url)
      var funky = url
      var user_id = receivedMessage.author.id
      var user_avatar = receivedMessage.author.avatar
      var info = await ytdl.getInfo(url, { filter: 'audioonly'})
      const song = {
        "videoLink": url,
        "title": info.videoDetails.title,
        // "title": info.title,
        "songLength": info.videoDetails.lengthSeconds,
        // "songLength": info.length_seconds,
        "author": receivedMessage.author.username,
        "authorProfilePicture": 'https://cdn.discordapp.com/avatars/'+user_id+'/'+user_avatar+'.png'
      }
      receivedMessage.guild.musicData.queue.push(song)
      if (receivedMessage.guild.musicData.isPlaying == false) { // if nothing is playing
        receivedMessage.guild.musicData.isPlaying = true;
        return playSong(receivedMessage.guild.musicData.queue); // play the playlist
      } else if (receivedMessage.guild.musicData.isPlaying == true) { // if something is already playing
        const videoEmbed = new Discord.MessageEmbed(song)
        .setAuthor(song.author, song.authorProfilePicture)
        .setTitle(`:musical_note: ${song.title} :musical_note: has been added to queue`)
        .setColor('#fffb19')
        .setTimestamp()
        return receivedMessage.say(videoEmbed);
      }
    };

    async function playSong(queue) {
      // console.log(queue)
      // console.log(queue[0])
      console.log(queue[0].videoLink)
      voiceChannel.join().then(connection => {
        const dispatcher = connection
        .play(
          ytdl(queue[0].videoLink, { // pass the url to .ytdl()
            quality: 'highestaudio',
            // download part of the song before playing it
            // helps reduces stuttering
            highWaterMark: 1024 * 1024 * 10
          })
        )
        .on('start', () => {
          // the following line is essential to other commands like skip
          receivedMessage.guild.musicData.songDispatcher = dispatcher;
          dispatcher.setVolume(receivedMessage.guild.musicData.volume);
          // voiceChannel = queue[0].voiceChannel;
          // display the current playing song as a nice little embed
          const videoEmbed = new Discord.MessageEmbed()
          .setAuthor(queue[0].author, queue[0].authorProfilePicture)
          .setThumbnail(queue[0].thumbnail) // song thumbnail
          .setColor('#2c7a26')
          .addField('Now Playing:', queue[0].title)
          .setURL(queue[0].link)
          .addField('Duration:', getSongLength(queue[0].songLength))
          .setTimestamp()
          // also display next song title, if there is one in queue
          if (queue[1]) videoEmbed.addField('Next Song:', queue[1].title);
          // receivedMessage.say(videoEmbed); // send the embed to chat
          return receivedMessage.say(videoEmbed);
        })
        .on('finish', () => {
           // this event fires when the song has ended
          queue.shift()
          if (queue.length >= 1) { // if there are more songs in queue
            return playSong(queue); // continue playing
          } else { // else if there are no more songs in queue
            receivedMessage.guild.musicData.isPlaying = false;
            return voiceChannel.leave(); // leave the voice channel
          }
        })
        .on('error', e => {
          receivedMessage.say('Cannot play song');
          receivedMessage.guild.musicData.queue.length = 0;
          receivedMessage.guild.musicData.isPlaying = false;
          receivedMessage.guild.musicData.nowPlaying = null;
          console.error(e);
          return voiceChannel.leave();
        });
      })
      .catch(e => {
        console.error(e);
        return voiceChannel.leave();
      });
    };

    function getSongLength(seconds){
      const convertThis = Number(seconds)
      if (convertThis < 3600){
          const result = timeFormat.fromS(convertThis, 'mm:ss')
          console.log(result)
          return result
      }
      else {
          const result = timeFormat.fromS(convertThis, 'hh:mm:ss')
          return result
      }
    };

  }
};
