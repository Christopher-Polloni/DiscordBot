const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const fetch = require("node-fetch");
const Discord = require('discord.js')

module.exports = class weatherCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'weather',
            group: 'miscellaneous',
            memberName: 'weather',
            description: 'Find out the weather',
            examples: ['weather'],
            guildOnly: false,
            argsType: 'multiple'
        })
    }
    async run(receivedMessage, args) {
        console.log(args)
        if (args.length == 0) {
            return receivedMessage.say(`You must provide a zipcode when using this command:\n\`weather <zipcode>\``)
        }
        else if (args.length == 1) {

            fetch(`http://api.openweathermap.org/data/2.5/weather?zip=${args[0]}&appid=${config.openWeatherMapKey}&units=imperial`)
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    console.log(data)
                    if (data.cod == 400 || data.cod == 404) {
                        return receivedMessage.say(`${args[0]} is an invalid zipcode.`)
                    }
                    else {
                        console.log(data.cod)
                        const embed = new Discord.MessageEmbed()
                            .setColor('RED')
                            .setTitle(data.name)
                            .setThumbnail(`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
                            .setDescription(`${data.weather[0].main} - ${data.weather[0].description}`)
                            .addField('Current Temp', `${Math.round(data.main.temp)}°F/${Math.round(toCelsius(data.main.temp))}°C`, true)
                            .setTimestamp()
                            .setFooter('Data Provided By OpenWeatherMapAPI');
                        if (data.wind.gust) {
                            embed.addFields(
                                { name: 'Humidity', value: `${Math.round(data.main.humidity)}%`, inline: true },
                                { name: 'Wind Speed/Gust', value: `${Math.round(data.wind.speed)}mph/${Math.round(data.wind.gust)}mph`, inline: true }
                            )
                        }
                        else {
                            embed.addFields(
                                { name: 'Humidity', value: `${Math.round(data.main.humidity)}%`, inline: true },
                                { name: 'Wind Speed', value: `${Math.round(data.wind.speed)}mph`, inline: true }
                            )
                        }
                        return receivedMessage.say(embed)
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }
};

function toCelsius(fahrenheitTemp) {
    let celsiusTemp = (fahrenheitTemp - 32) * (5 / 9)
    return celsiusTemp
}