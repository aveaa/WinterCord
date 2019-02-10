/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'balance',
      group: 'economics',
      memberName: 'balance',
      aliases: ['b', 'bal', 'money', 'баланс', 'деньги'],
      description: 'Просмотр баланса',
      details: 'Команда для просмотра баланса',
      examples: ['bal', 'bal @zziger#8040'],
      guildOnly: true,

      args: [
        {
          key: 'member',
          prompt: 'Чей баланс вы хотели бы посмотреть?',
          type: 'member',
          default: '',
        },
      ],
    });

    this.lastResult = null;
  }

  // eslint-disable-next-line
  async run(msg, args, fromPattern) {
    let { member } = args;
    let own = false;
    if (!member) {
      ({ member } = msg);
      own = true;
    } else {
      own = member.user.id === msg.author.id;
    }
    const user = await User.getUser(member.id);
    const embed = new Discord.RichEmbed()
      .setAuthor(member.user.tag, member.user.avatarURL)
      .addField(own ? 'Ваш баланс:' : 'Баланс:', user.balance ? user.balance.toString() : '0');
    const buffer = await new Promise(resolve => request({ url: member.user.avatarURL, encoding: null }, (err, response, data) => {
      if (err) throw err;
      resolve(data);
    }));
    const colors = await getColor(buffer, 'image/png');
    const color = colors[0].hex();
    if (color) embed.setColor(color);
    // noinspection JSUnresolvedFunction
    msg.channel.send(embed);
    return null;
  }
};
