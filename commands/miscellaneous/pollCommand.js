const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');
const Discord = require('discord.js');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const schedule = require('node-schedule');

module.exports = class pollCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'miscellaneous',
            memberName: 'poll',
            description: 'Set up a poll in a channel.',
            examples: [`poll <#channel>\n<question>\n<option 1>\n<option 2>\n<option 3>`],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_GUILD']
        })
    }
    async run(receivedMessage, args) {
        const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        if (!args) {
            return receivedMessage.say('To properly use this command, use the following format, ensuring that the question and each option are on a new line within the original message. A number emoji will automatically be added to each option\n```poll <#channel>\n<question>\n<option 1>\n<option 2>\n<option 3>```')
        }
        if (receivedMessage.mentions.channels.first()) {
            const channelId = receivedMessage.mentions.channels.first().id;
            const channel = receivedMessage.guild.channels.cache.find(ch => ch.id === channelId);
            const allArgs = args.split('\n')
            if (allArgs.length < 4) {
                return receivedMessage.say('You must ask a question and provide at least two possible responses.')
            }
            if (allArgs.length > 12) {
                return receivedMessage.say('The maximum number of options per poll is 10.')
            }
            const question = allArgs[1]
            const options = allArgs.slice(2)

            let pollOptions = '';
            options.forEach((element, index) => {
                pollOptions = pollOptions.concat(`${reactions[index]} ${element}\n`)
            })
            const pollSettings = {
                channelId: channelId,
                question: question,
                pollOptions: pollOptions,
                numberOptions: options.length,
                reactions: reactions
            }
            receivedMessage.say('Do you want poll results to be announced at a certain time? Respond with yes or no.')

            const acceptedResponses = ['yes', 'y', 'no', 'n']
            const filter = m => receivedMessage.author.id === m.author.id && acceptedResponses.includes(m.content.toLowerCase())

            receivedMessage.channel.awaitMessages(filter, { time: 30000, max: 1, errors: ['time'] })
                .then(async message => {
                    if (message.first().content.toLowerCase() == 'yes' || message.first().content.toLowerCase() == 'y') {
                        getDate(receivedMessage, pollSettings)
                    }
                    else {
                        const embed = new Discord.MessageEmbed()
                            .setColor('BLUE')
                            .setDescription(pollOptions)
                        channel.send(`📊 ${question}`, embed).then(function (message) {
                            for (let i = 0; i < options.length; i++) {
                                message.react(reactions[i])
                            }
                        })
                    }
                })
                .catch((e) => {
                    return receivedMessage.say('Too much time has elapsed without a proper answer. To have your poll sent, please restart the command.')
                });



        }
        else {
            return receivedMessage.say('You must mention a channel for the poll to be sent in!. Run \`poll\` to see an example of how to make a poll.')
        }


    }
};



async function getDate(receivedMessage, pollSettings) {

    receivedMessage.say("Please enter the day for your poll to end using the format 'MM/DD/YY'.").then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {

                const dateInput = messages.first().content.split("/");
                const yearEnd = dateInput[2];
                const yearStart = '20';
                const year = yearStart.concat(yearEnd)
                if (year !== "2021") {
                    receivedMessage.say('Currently messages can only be made through the end of 2021.');
                    return getDate(receivedMessage, pollSettings);
                }
                const month = dateInput[0] - 1;
                const day = dateInput[1];

                if (!moment([year, month, day]).isValid()) {
                    receivedMessage.say('The date for this message is not valid.')
                    return getDate(receivedMessage, pollSettings);
                }

                const date = new Date(year, month, day, 23, 59, 59);

                const difference = date - new Date();
                if (difference <= 0) {
                    receivedMessage.say('The date for this message has already passed!');
                    return getDate(receivedMessage);
                }

                return getTime(receivedMessage, pollSettings, month, day, year);
            })
            .catch((e) => {
                console.error(e);
                newmsg.channel.send("Too much time has elapsed! To have your poll sent, please restart the command.");
            });
    });

}

async function getTime(receivedMessage, pollSettings, month, day, year) {

    receivedMessage.say("Please enter the time for your reminder using the format 'hh:mm AM' or 'hh:mm PM'").then((newmsg) => {
        const filter = m => receivedMessage.author.id === m.author.id;

        newmsg.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(messages => {

                const completeTime = messages.first().content.split(" ");
                const timeOfDay = completeTime[1];
                const timeOfDayAccepted = ["am", "a.m.", "pm", "p.m."];
                const possibleHours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
                const militaryHours = ["0", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
                const time = completeTime[0].split(':');
                let hours = time[0];
                let minutes = time[1];

                if (timeOfDayAccepted.includes(timeOfDay.toLowerCase())) {
                    if (timeOfDay.toLowerCase() == 'am' || timeOfDay.toLowerCase() == 'a.m.') {
                        if (hours == '12') {
                            hours = 0;
                        }
                        else if (hours !== '12' && possibleHours.includes(hours)) {
                            hours = hours;
                        }
                        else if (militaryHours.includes(hours)) {
                            receivedMessage.say('Military time is not supported.');
                            return getTime(receivedMessage, pollSettings, month, day, year);
                        }
                        else {
                            receivedMessage.say('There was an error with the time you input.');
                            return getTime(receivedMessage, pollSettings, month, day, year);
                        }

                    }
                    else {
                        if (hours == '12') {
                            hours = hours;
                        }
                        else if (hours !== '12' && possibleHours.includes(hours)) {
                            hours = Number(hours) + 12;
                        }
                        else if (militaryHours.includes(hours)) {
                            receivedMessage.say('Military time is not supported.');
                            return getTime(receivedMessage, pollSettings, month, day, year);
                        }
                        else {
                            receivedMessage.say('There was an error with the time you input.');
                            return getTime(receivedMessage, pollSettings, month, day, year);
                        }
                    }
                }
                else {
                    receivedMessage.say('AM/PM not recognized');
                    return getTime(receivedMessage, pollSettings, month, day, year);
                }

                if (!moment([year, month, day, hours, minutes]).isValid()) {
                    receivedMessage.say('The time for this reminder is not valid.')
                    return getTime(receivedMessage, pollSettings, month, day, year);
                }

                const date = new Date(year, month, day, hours, minutes, 00);
                const difference = date - new Date();
                if (difference <= 0) {
                    receivedMessage.say('The date and time for this reminder has already passed!');
                    return getTime(receivedMessage, pollSettings, month, day, year);
                }
                else {
                    pollSettings.date = date
                    return setupPoll(receivedMessage, pollSettings)
                }

            })
            .catch((e) => {
                console.log(e)
                return newmsg.channel.send("Too much time has elapsed! To have your poll sent, please restart the command.");
            });
    });

}

async function setupPoll(receivedMessage, pollSettings) {
    const channel = receivedMessage.guild.channels.cache.find(ch => ch.id === pollSettings.channelId);
    const embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setDescription(pollSettings.pollOptions)
        .setFooter(`Results will be announced on ${pollSettings.date.toLocaleString()} ${config.timeZone}`)
    channel.send(`📊 ${pollSettings.question}`, embed).then(function (message) {
        for (let i = 0; i < pollSettings.numberOptions; i++) {
            message.react(pollSettings.reactions[i])
        }
        pollSettings.messageId = message.id
        pollSettings.guildId = receivedMessage.guild.id
    })

    try {

        const client2 = new MongoClient(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        await client2.connect();
        let result = await client2.db("DiscordBot").collection("Polls").insertOne(pollSettings);

        schedule.scheduleJob('poll_' + result.insertedId, pollSettings.date, async function () {
            try {
                let channel = receivedMessage.guild.channels.cache.find(ch => ch.id === pollSettings.channelId);
                let message = await channel.messages.fetch(pollSettings.messageId)
                let votes = []
                for (let i = 0; i < pollSettings.numberOptions; i++) {
                    votes.push(message.reactions.cache.get(pollSettings.reactions[i]).count - 1)
                }
                let results = ''
                for (let i = 0; i < votes.length; i++){
                    results = results + `${pollSettings.reactions[i]}\t\t${votes[i]}\n`
                }
                const embed = new Discord.MessageEmbed()
                    .setColor('BLUE')
                    .setTitle('📊 Poll Results')
                    .setDescription(`[${pollSettings.question}](${message.url})\n${pollSettings.pollOptions}\n\`\`\`Option\tNumber of Votes\n${results}\`\`\``)
                channel.send(embed)
            } catch (e) {
                console.error(e);
            } finally {
                let deletion = await client2.db("DiscordBot").collection("Polls")
                    .deleteOne({ _id: result.insertedId });
            }
        });

    } catch (e) {
        console.error(e);
    }
}