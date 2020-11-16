const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class rockPaperScissorsCommand extends Commando.Command{
    constructor(client){
      super(client, {
        name : 'rps',
        group : 'games',
        memberName : 'rps',
        description : 'Play a simple game of rock, paper, scissors with the bot.',
        examples: ['rps rock', 'rps paper', 'rps scissors'],
        guildOnly: false,
        argsType: 'single'
      })
    }
    async run (receivedMessage, arg) {
      const rpsBotChoice = Math.random();
      console.log(rpsBotChoice)
      let botChoice = null;
      if (rpsBotChoice <= .33) {
        botChoice = "rock"
      }
      else if (rpsBotChoice > .33 && rpsBotChoice < .67) {
        botChoice = "paper"
      }
      else {
        botChoice = "scissors"
      }
      if (arg == "rock"){
        if (botChoice == "rock"){
          receivedMessage.channel.send(`${receivedMessage.author}: 👊\n${receivedMessage.client.user}: 👊\nWe tied! 😮`)
        }
        else if (botChoice == "paper"){
          receivedMessage.channel.send(`${receivedMessage.author}: 👊\n${receivedMessage.client.user}: ✋\nYou lose! 😜`)
        }
        else {
          receivedMessage.channel.send(`${receivedMessage.author}: 👊\n${receivedMessage.client.user}: ✌\nYou win! 😭`)
        }
      }
      else if (arg == "paper"){
        if (botChoice == "rock"){
          receivedMessage.channel.send(`${receivedMessage.author}: ✋\n${receivedMessage.client.user}: 👊\nYou win! 😭`)
        }
        else if (botChoice == "paper"){
          receivedMessage.channel.send(`${receivedMessage.author}: ✋\n${receivedMessage.client.user}: ✋\nWe tied! 😮`)
        }
        else {
          receivedMessage.channel.send(`${receivedMessage.author}: ✋\n${receivedMessage.client.user}: ✌\nYou lose! 😜`)
        }
      }
      else if (arg == "scissors"){
        if (botChoice == "rock"){
          receivedMessage.channel.send(`${receivedMessage.author}: ✌\n${receivedMessage.client.user}: 👊\nYou lose! 😜`)
        }
        else if (botChoice == "paper"){
          receivedMessage.channel.send(`${receivedMessage.author}: ✌\n${receivedMessage.client.user}: ✋\nYou win! 😭`)
        }
        else {
          receivedMessage.channel.send(`${receivedMessage.author}: ✌\n${receivedMessage.client.user}: ✌\nWe tied! 😮`)
        }
      }
      else {
        receivedMessage.channel.send("Want to play? Try `$rps rock` , `$rps paper`, or `$rps scissors`")
      }
    }
};
