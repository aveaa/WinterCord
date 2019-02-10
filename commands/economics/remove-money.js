/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-money',
      group: 'economics',
      memberName: 'remove-money',
      aliases: ['rm'],
      description: 'Добавляет денег',
      details: 'Команда для удаления денег определенному участнику',
      examples: ['remove-money @zziger#8040 999'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

      args: [
        {
          key: 'member',
          prompt: 'Кому бы вы хотели убрать денег?',
          type: 'member',
        },
        {
          key: 'count',
          prompt: 'Сколько бы вы хотели убрать денег?',
          type: 'integer',
        },
      ],
    });

    this.lastResult = null;
  }

  // eslint-disable-next-line
  async run(msg, args, fromPattern) {
    const { member } = args;
    let { count } = args;
    if (count === 0) return msg.channel.send('Удалить 0? Серьезно?');
    if (count < 0) return msg.channel.send('Я не могу удалить отрицательную сумму, сорри ¯\\_(ツ)_/¯');

    const user = await User.getUser(member.id);
    if (typeof count !== 'number') throw Error();
    if (count < 0) count *= -1;
    const { oldBalance, newBalance, removed } = await user.removeMoney(count);
    // noinspection JSUnresolvedFunction
    msg.channel.send(`Деньги были успешно удалены у пользователя ${member}.\n\nСтарый баланс: \`${oldBalance}\`\nУдалено: \`${removed}\`\nНовый баланс: \`${newBalance}\``);
    return null;
  }
};
