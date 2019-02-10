/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'inv',
      group: 'rp',
      memberName: 'inv',
      aliases: ['inventory', 'инвентарь'],
      description: 'Инвентарь пользователя',
      details: 'Команда для просмотра инвентаря пользователя',
      examples: ['inv'],
      guildOnly: true,

      args: [
        {
          key: 'member',
          prompt: 'Чей инвентарь вы хотели бы посмотреть?',
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
      .setAuthor(member.user.tag, member.user.avatarURL);
    const armor = Object.values(Object.filter(user.fetchedArmor, a => a == null)).map(i => `${armorPieces[i.subtype]}: ${i.toString()}`).join('\n');
    if (armor) embed.addField(own ? 'Ваша броня:' : 'Броня:', armor || '*Броня отсутствует*');
    embed.addField(own ? 'Ваш инвентарь:' : 'Инвентарь:', items.map(i => i.toString()).join('\n') || '*В инвентаре нет предметов*');
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
