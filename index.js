/* eslint-disable no-tabs */
// let Discord = require('discord.js');
// let client = new Discord.Client();
// let getinv = {};
//
// client.on('message', (message) => {
// 	if (message.author.id === '292953664492929025') {
// 		//if (message.embeds.length === 0) return;
// 	    if (!(message.embeds[0].author.name in getinv)) return;
// 	    message.guild.channels.get(getinv[message.embeds[0].author.name]).send(message.embeds[0].description);
// 	    delete getinv[message.embeds[0].author.name];
//
// 		return;
// 	}
// 	if (message.content.startsWith('eval') && message.author.id === '421030089732653057') {
// 		return message.channel.send(JSON.stringify(eval(message.content.slice(4)), null, 2))
// 	}
// 	if (message.author.bot) return;
// 	if (message.content === 'getinv') {
// 		getinv[message.author.tag] = message.channel.id;
// 		message.guild.channels.get('539032276084850693').send(`say !inv ${message.member}`)
// 	}
//
// });
//
// client.login(process.env.MainToken);
//
// let helper = new Discord.Client();
// helper.on('message', (message) => {
// if (message.author.id !== '535605664211533854') return;
// if (message.content.startsWith('say')) {
// 		return message.channel.send(message.content.slice(3))
// 		}
// });
// helper.login(process.env.HelperToken);

/*
* Checking for all needed environment variables.
* */
['MainToken', 'HelperToken'].forEach(env => {
  if (!(env in process.env)) throw Error(`You need to provide an "${env}" environment variable.`);
});

global.console.chalk = require('chalk');
global.Discord = require('discord.js');

console.log(console.chalk`{bold.greenBright Bot process started.}\nInitializing main class...`);
global.Bot = new (require('./Bot'))();
