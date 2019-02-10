/* eslint-disable no-underscore-dangle */
const { Command } = Commando;
const Discord = require('discord.js');
const getColor = require('get-image-colors');
const request = require('request');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-item',
      group: 'rp',
      memberName: 'create-item',
      aliases: ['ci'],
      description: 'Создаёт предмет',
      details: 'Команда для создания новых предметов',
      examples: ['ci'],
      guildOnly: true,
      ownerOnly: true, // todo remove this
      userPermissions: ['ADMINISTRATOR'],
    });

    this.lastResult = null;
  }

  // eslint-disable-next-line
  async run(msg, args, fromPattern) {
    return null;
  }
};
