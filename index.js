const ENV_VARS = ['MainToken', 'Mongo'];
ENV_VARS.forEach((env) => {
  if (!(env in process.env)) throw Error(`You need to set an environment variable named "${env}"`);
});

global.Commando = require('discord.js-commando');
global.tags = require('common-tags');
global.Item = require('./classes/Item');
global.User = require('./classes/User');
const { MongoClient } = require('mongodb');
const MongoDBProvider = require('commando-provider-mongo');
const path = require('path');

global.Client = new Commando.Client({
  owner: '421030089732653057',
  unknownCommandResponse: false,
  commandPrefix: '>',
});

global.Object.filter = function filter(obj, predicate) {
  const result = {};
  let key;

  for (key in obj) {
    if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
      result[key] = obj[key];
    }
  }

  return result;
};


Client.login(process.env.MainToken).catch((e) => {
  throw e;
});


Commando.Command.usage = (command, prefix = null, user = null) => {
  const nbcmd = command.replace(/ /g, '\xa0');
  if (!prefix && !user) return `\`${nbcmd}\``;

  let prefixPart;
  if (prefix) {
    if (prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' ';
    prefix = prefix.replace(/ /g, '\xa0');
    prefixPart = `\`${prefix}${nbcmd}\``;
  }

  let mentionPart;
  if (user) mentionPart = `\`@${user.username.replace(/ /g, '\xa0')}#${user.discriminator}\xa0${nbcmd}\``;

  return `${prefixPart || ''}${prefix && user ? ' или ' : ''}${mentionPart || ''}`;
};


Client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('debug', console.log)
  .on('ready', () => {
    console.log(`Client ready; logged in as ${Client.user.username}#${Client.user.discriminator} (${Client.user.id})`);
  })
  .on('disconnect', () => { console.warn('Disconnected!'); })
  .on('reconnecting', () => { console.warn('Reconnecting...'); })
  .on('commandError', (cmd, err) => {
    // if (err instanceof Client.FriendlyError) return;
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
  })
  .on('commandBlocked', (msg, reason) => {
    console.log(tags.oneLine`
      Команда ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
      заблокирована; ${reason}
    `);
  })
  .on('commandPrefixChange', (guild, prefix) => {
    console.log(tags.oneLine`
      Префикс ${prefix === '' ? 'удалён' : `изменен ${prefix || 'к умолчанию'}`}
      ${guild ? `на сервере ${guild.name} (${guild.id})` : 'глобально'}.
    `);
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    console.log(tags.oneLine`
      Команда ${command.groupID}:${command.memberName}
      ${enabled ? 'включена' : 'отключена'}
      ${guild ? `на сервере ${guild.name} (${guild.id})` : 'глобально'}.
    `);
  })
  .on('groupStatusChange', (guild, group, enabled) => {
    console.log(tags.oneLine`
      Группа ${group.id}
      ${enabled ? 'включена' : 'отключена'}
      ${guild ? `на севрере ${guild.name} (${guild.id})` : 'глобально'}.
    `);
  });

// Client.setProvider(
//   MongoClient.connect('mongodb+srv://WintercordBOT:re0vzADv3KioFMRN@wintercordbot-bibzj.mongodb.net/test?retryWrites=true').then(client => new MongoDBProvider(client, 'wintercord')),
// ).catch(console.error);

global.DB = new MongoClient(process.env.Mongo, { useNewUrlParser: true });
// noinspection JSIgnoredPromiseFromCall
DB.connect((err) => {
  if (err) throw err;
  Client.setProvider(new MongoDBProvider(DB, 'wintercord')).catch(console.error);
});

Client.registry
  .registerGroup('economics', 'Экономика')
  .registerGroup('util', 'Утилиты')
  .registerGroup('rp', 'RP')
  .registerDefaultTypes()
  .registerTypesIn(path.join(__dirname, 'types'))
  .registerCommandsIn(path.join(__dirname, 'commands'));
