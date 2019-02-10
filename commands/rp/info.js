/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      group: 'rp',
      memberName: 'info',
      aliases: ['инфо', 'information', 'stat', 'stats', 'стата', 'i'],
      description: 'Информация о пользователе',
      details: 'Команда для просмотра информации о пользователе',
      examples: ['inv'],
      guildOnly: true,

      args: [
        {
          key: 'member',
          prompt: 'Чью информацию хотели бы вы посмотреть?',
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
    await user.fetchItems();
    await user.fetchArmor();
    const armorPieces = {
      helmet: 'Шлем',
      chestplate: 'Нагрудник',
      leggings: 'Штаны',
      boots: 'Ботинки',
    };
    const items = user.fetchedItems;
    const embed = new Discord.RichEmbed()
      .setAuthor(member.user.tag, member.user.avatarURL)
      .addField('Основная информация', `_ _\n${user.hp}/${user.max_hp} \\💟\n${user.protection}/${user.maxProtection} \\🛡️\n${user.balance} <:septim:535537382955417603>\n\n_ _`, true);
    const armor = Object.values(Object.filter(user.fetchedArmor, a => a == null)).map(i => `${armorPieces[i.subtype]}: ${i.toString()}`).join('\n');
    if (armor) embed.addField(own ? 'Ваша броня:' : 'Броня:', armor || '*Броня отсутствует*', true);
    embed.addField(own ? 'Ваш инвентарь:' : 'Инвентарь:', items.map(i => i.toString()).join('\n') || '*В инвентаре нет предметов*', true);
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
