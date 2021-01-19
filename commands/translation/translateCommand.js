const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js')
const axios = require('axios').default;
const uuidv4 = require('uuid');

module.exports = class translateCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'translate',
            group: 'translation',
            memberName: 'translate',
            description: 'View what languages are available for translation or translate a message',
            examples: ['translate', 'translate <language code> <message>'],
            guildOnly: true,
            argsType: 'single'
        })
    }
    async run(receivedMessage, arg) {
        if (!arg) {
            let message = `Emoji | Language Code | Language\n`
            for (let x in config.languages) {
                message = message.concat(`${x} | ${config.languages[x].abbreviation} | ${config.languages[x].language}\n`)
            }
            const embed = new Discord.MessageEmbed()
                .setTitle('Translation Options')
                .setColor('BLUE')
                .setDescription(message)
                .setFooter(`To translate a message, use the command \`translate <language code> <message>\`\nIf enabled in your server, you can also react to a message with a flag emoji to have it translated.\nTo toggle reaction translation in servers, use the command \`toggle-translation on\` or \`toggle-translation off\``)
            return receivedMessage.say(embed)
        }
        else {
            const languageCode = arg.slice(0, 2)
            let isValid = false
            for (let x in config.languages) {
                if (config.languages[x].abbreviation == languageCode) {
                    isValid = true
                }
            }
            if (isValid) {
                axios({
                    baseURL: config.translationEndpoint,
                    url: '/translate',
                    method: 'post',
                    headers: {
                        'Ocp-Apim-Subscription-Key': config.translationSubscriptionKey,
                        'Content-type': 'application/json',
                        'X-ClientTraceId': uuidv4.v4().toString(),
                        'Ocp-Apim-Subscription-Region': 'eastus'
                    },
                    params: {
                        'api-version': '3.0',
                        'to': languageCode
                    },
                    data: [{
                        'text': arg.substr(2)
                    }],
                    responseType: 'json'
                }).then(function (response) {
                    receivedMessage.say(response.data[0].translations[0].text)
                }).catch(function (error) {
                    console.error('There was an error translating a message\n', error);
                })
            }
            else {
                receivedMessage.say('That is not a valid language code. To view the possible languages to translate to, run the `translate` command.\nAn example of how to translate is `translate es Hello, I want this translated to Spanish`')
            }
        }
    }
};

