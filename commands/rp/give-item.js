/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'give-item',
      group: 'rp',
      memberName: 'give-item',
      aliases: ['gi'],
      description: 'Передает предмет пользователю',
      details: 'Команда для передачи предмета определенному пользователю',
      examples: ['gi @zziger#8040 5'],
      guildOnly: true,

      args: [
        {
          key: 'member',
          prompt: 'Кому бы вы хотели передать предмет?',
          type: 'member',
        },
        {
          key: 'id',
          prompt: 'Айди предмета для передачи',
          type: 'integer',
        },
      ],
    });

    this.lastResult = null;
  }

  // eslint-disable-next-line
  async run(msg, args, fromPattern) {
    const { member, id } = args;

    const item = await Item.getInventoryItem(id);
    if (item.user !== msg.author.id) return msg.channel.send('Ты уверен, что это твой предмет?');

    await item.transferTo(member.user.id);

    return null;
  }
};
