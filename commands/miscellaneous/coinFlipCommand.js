const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class coinFlipCommand extends Commando.Command{
  constructor(client){
    super(client, {
      name : 'flip',
      group : 'miscellaneous',
      memberName : 'flip',
      description : 'Flip some coins',
      examples: ['$flip\n$flip <number>'],
      guildOnly: false,
      argsType: 'multiple'
    })
  }
  async run (receivedMessage, args) {
    var heads = 0
    var tails = 0
    var tosses = args[0]
    if (args.length == 0){
      var coin = Math.round(Math.random());
      if (coin == 0){
        receivedMessage.channel.send("Heads!")
      }
      else {
        receivedMessage.channel.send("Tails!")
      }
    }
    else if (args.length == 1){
      if (tosses > 2000000){
        receivedMessage.channel.send("I CAN'T SIT HERE ALL DAY FLIPPING COINS!! (╯°□°）╯︵ ┻━┻")
      }
      else if (tosses <= 2000000){
        var i;
        for (i = 0; i < tosses; i++){
          var coin = Math.round(Math.random());
          if(coin == 0){
            heads++
          }
          else {
            tails++
          }
        }
        if (tosses <= 100){
          receivedMessage.channel.send("Number of coin flips: " + tosses + "\nHeads: " + heads + "\nTails: " + tails)
        }
        else if (100 < tosses && tosses <= 1000){
          receivedMessage.channel.send("That's a lot of coin flips!\nNumber of coin flips: " + tosses + "\nHeads: " + heads + "\nTails: " + tails)
        }
        else if (1000 < tosses && tosses <= 2000000){
          receivedMessage.channel.send("Why are you flipping so many coins!?!?\nNumber of coin flips: " + tosses + "\nHeads: " + heads + "\nTails: " + tails)
        }
      }
      else{
        receivedMessage.channel.send("I don't understand your command. Try `$flip` or `$flip <number of flips>`")
      }
    }
  }
};
