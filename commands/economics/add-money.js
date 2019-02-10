/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add-money',
      group: 'economics',
      memberName: 'add-money',
      aliases: ['am'],
      description: 'Добавляет денег',
      details: 'Команда для добавления денег определенному участнику',
      examples: ['add-money @zziger#8040 999'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

      args: [
        {
          key: 'member',
          prompt: 'Кому бы вы хотели добавить денег?',
          type: 'member',
        },
        {
          key: 'count',
          prompt: 'Сколько бы вы хотели добавить денег?',
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
    if (count === 0) return msg.channel.send('Добавить 0? Серьезно?');
    if (count < 0) return msg.channel.send('Я не могу добавить отрицательную сумму, сорри ¯\\_(ツ)_/¯');

    const user = await User.getUser(member.id);
    if (typeof count !== 'number') throw Error();
    if (count < 0) count *= -1;
    const { oldBalance, newBalance, added } = await user.addMoney(count);
    // noinspection JSUnresolvedFunction
    msg.channel.send(`Деньги были успешно добавлены пользователю ${member}.\n\nСтарый баланс: \`${oldBalance}\`\nДобавлено: \`${added}\`\nНовый баланс: \`${newBalance}\``);
    return null;
  }
};
