/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add-item',
      group: 'rp',
      memberName: 'add-item',
      aliases: ['ai'],
      description: 'Добавляет предмет пользователю',
      details: 'Команда для добавления предмета определенному пользователю',
      examples: ['ai'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

      args: [
        {
          key: 'member',
          prompt: 'Кому бы вы хотели выдать предмет?',
          type: 'member',
        },
        {
          key: 'name',
          prompt: 'Название предмета для выдачи',
          type: 'string',
        },
      ],
    });

    this.lastResult = null;
  }

  // eslint-disable-next-line
  async run(msg, args, fromPattern) {
    const { member, name } = args;
    try {
      const user = await User.getUser(member.user.id);
      await user.addItem(name);
      msg.channel.send('Предмет был добавлен успешно.');
    } catch (e) {
      console.error(e);
      return msg.channel.send('Произошла ошибка. Скорее всего такого предмета нет.');
    }
    return null;
  }
};
