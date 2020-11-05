const Commando = require('discord.js-commando');
const path = require('path');
const config = require('../../config.js');

module.exports = class roleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'role',
            group: 'moderation',
            memberName: 'role',
            description: 'Assign roles to a member of the server.',
            examples: [`role add <user> <roles>\n---------`, `role remove <user> <roles>\n---------`, `role add name <user>\n<role1 name>\n<role2 name>\n---------`, `role remove name <user>\n<role1 name>\n<role1 name>`],
            guildOnly: true,
            argsType: 'single',
            userPermissions: ['MANAGE_ROLES']
        })
    }
    async run(receivedMessage, args) {
        const user = receivedMessage.mentions.users.first();
        const member = receivedMessage.guild.member(user);
        const roles = receivedMessage.mentions.roles.array();
        if (!args){
            return receivedMessage.say(`To properly use this command, use one of the following formats\n---------\nrole add <user> <roles>\n---------\nrole remove <user> <roles>\n---------\nrole add name <user>\n<role1 name>\n<role2 name>\n---------\nrole remove name <user>\n<role1 name>\n<role1 name>\n---------\nWhen adding/removing by name instead of mention, please ensure the name of each role is on a new line`)
        }
        if (user) {
            const member = receivedMessage.guild.member(user);
            if (member) {
                const eachArg = args.split(' ')
                if (eachArg[0] == 'add' && eachArg[1] == 'name') {
                    const eachRole = args.split('\n')
                    eachRole.shift();
                    if (eachRole.length > 0) {
                        for (let i = 0; i < eachRole.length; i++) {
                            const role = receivedMessage.guild.roles.cache.find(role => role.name === eachRole[i]);
                            if (role) {
                                if (member.roles.cache.some(role => role.name === eachRole[i])) {
                                    receivedMessage.say(`${user.username} already has the role '${eachRole[i]}'`);
                                }
                                else {
                                    member.roles.add(role);
                                    receivedMessage.say(`${user.username} was successfully given the role '${eachRole[i]}'`);
                                }
                            }
                            else {
                                receivedMessage.say(`Could not find the role '${eachRole[i]}' in this server.`)
                            }
                        }
                    }
                    else {
                        return receivedMessage.say(`No role names were listed or you did not list each one on a new line!`)
                    }
                }
                else if (eachArg[0] == 'add') {
                    if (roles.length > 0) {
                        for (let i = 0; i < roles.length; i++) {
                            const role = receivedMessage.guild.roles.cache.find(role => role.name === roles[i].name);
                            if (role) {
                                if (member.roles.cache.some(role => role.name === roles[i].name)) {
                                    receivedMessage.say(`${user.username} already has the role '${roles[i].name}'`);
                                }
                                else {
                                    member.roles.add(role);
                                    receivedMessage.say(`${user.username} was successfully given the role '${roles[i].name}'`);
                                }
                            }
                            else {
                                receivedMessage.say(`Could not find the role '${roles[i].name}' in this server.`)
                            }
                        }
                    }
                    else {
                        return receivedMessage.say(`No role names were listed or you did not list each one on a new line!`)
                    }
                }                
                else if (eachArg[0] == 'remove' && eachArg[1] == 'name') {
                    const eachRole = args.split('\n')
                    eachRole.shift();
                    if (eachRole.length > 0) {
                        for (let i = 0; i < eachRole.length; i++) {
                            const role = receivedMessage.guild.roles.cache.find(role => role.name === eachRole[i]);
                            if (role) {
                                if (!member.roles.cache.some(role => role.name === eachRole[i])) {
                                    receivedMessage.say(`${user.username} doesn't have the role '${eachRole[i]}'`);
                                }
                                else {
                                    member.roles.remove(role);
                                    receivedMessage.say(`'${eachRole[i]}' was successfully removed from ${user.username}`);
                                }
                            }
                            else {
                                receivedMessage.say(`Could not find the role '${eachRole[i]}' in this server.`)
                            }
                        }
                    }
                    else {
                        return receivedMessage.say(`No role names were listed or you did not list each one on a new line!`)
                    }
                }
                else if (eachArg[0] == 'remove') {
                    if (roles.length > 0) {
                        for (let i = 0; i < roles.length; i++) {
                            const role = receivedMessage.guild.roles.cache.find(role => role.name === roles[i].name);
                            if (role) {
                                if (!member.roles.cache.some(role => role.name === roles[i].name)) {
                                    receivedMessage.say(`${user.username} doesn't have the role '${roles[i].name}'`);
                                }
                                else {
                                    member.roles.remove(role);
                                    receivedMessage.say(`'${roles[i].name}' was successfully removed from ${user.username}`);
                                }
                            }
                            else {
                                receivedMessage.say(`Could not find the role '${roles[i].name}' in this server.`)
                            }
                        }
                    }
                    else {
                        return receivedMessage.say(`No role names were listed or you did not list each one on a new line!`)
                    }
                }
                else {
                    return receivedMessage.say(`To properly use this command, use one of the following formats\n---------\nrole add <user> <roles>\n---------\nrole remove <user> <roles>\n---------\nrole add name <user>\n<role1 name>\n<role2 name>\n---------\nrole remove name <user>\n<role1 name>\n<role1 name>\n---------\nWhen adding/removing by name instead of mention, please ensure the name of each role is on a new line`)
                }
            }
            else {
                return receivedMessage.say(`${user.tag} is not currently in this server`)
            }
        }
        else {
            return receivedMessage.say(`You either didn't mention a user or the user mentioned recently left the server!`);
        }
    }
};
