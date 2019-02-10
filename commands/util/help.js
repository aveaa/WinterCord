module.exports = class HelpCommand extends Commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'help',
      group: 'util',
      memberName: 'help',
      aliases: ['commands', 'помощь', 'команды'],
      description: 'Отображает список доступных команд или детальную информацию об одной из команд.',
      details: tags.oneLine`
        Отображает информацию об определенной команде.
        Если команда не указана, отображает список доступных команд.
      `,
      examples: ['help'],
      guarded: true,

      args: [
        {
          key: 'command',
          prompt: 'Об какой команде вы бы хотели узнать по-подробнее?',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  async run(msg, args) { // eslint-disable-line complexity
    const { groups } = Client.registry;
    const commands = Client.registry.findCommands(args.command, false, msg);
    const showAll = args.command && args.command.toLowerCase() === 'all';
    if (args.command && !showAll) {
      if (commands.length === 1) {
        let help = tags.stripIndents`
          ${tags.oneLine`
            __Команда **${commands[0].name}**:__ ${commands[0].description}
            ${commands[0].guildOnly ? ' (Может использоваться только на сервере)' : ''}
            ${commands[0].nsfw ? ' (NSFW)' : ''}
          `}
          **Синтаксис:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
        `;
        if (commands[0].aliases.length > 0) help += `\n**Возможные вариации:** ${commands[0].aliases.join(', ')}`;
        help += `\n${tags.oneLine`
          **Группа:** ${commands[0].group.name}
        `}`;
        if (commands[0].details) help += `\n**Описание:** ${commands[0].details}`;
        if (commands[0].examples) help += `\n**Примеры:**\n${commands[0].examples.join('\n')}`;

        const messages = [];
        try {
          messages.push(await msg.direct(help));
          if (msg.channel.type !== 'dm') messages.push(await msg.reply('Проверьте личные сообщения.'));
        } catch (err) {
          messages.push(await msg.reply('Не могу отправить Вам личное сообщение. Возможно, ваш ЛС закрыт.'));
        }
        return messages;
      }
      if (commands.length > 15) {
        return msg.reply('Найдено несколько команд. Пожалуйста, укажите какую именно вы хотите видеть');
      }
      if (commands.length > 1) {
        return msg.reply(Commando.util.disambiguation(commands, 'commands'));
      }
      return msg.reply(
        `Команда не найдена. Используйте ${msg.usage(
          null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined,
        )} для просмотра списка доступных команд.`,
      );
    }
    const messages = [];
    try {
      messages.push(await msg.direct(tags.stripIndents`
          ${tags.oneLine`
            Чтобы выполнить команду на ${msg.guild ? msg.guild.name : 'сервере'},
            используйте ${Commando.Command.usage('команда', msg.guild ? msg.guild.commandPrefix : null, Client.user)}.
            Например, ${Commando.Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, Client.user)}.
          `}
          Чтобы запустить команду в этом ЛС достаточно написать ${Commando.Command.usage('команда', null, null)} без префикса.
          Используйте ${this.usage('<command>', null, null)} для просмотра детальной информации об определенной команде.
          __**${showAll ? 'Все команды' : `Команды, доступные в ${msg.guild || 'этом ЛС'}`}**__
          ${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
    .map(grp => tags.stripIndents`
              __${grp.name}__
              ${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
    .map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
}
            `).join('\n\n')
}
        `, { split: true }));
      if (msg.channel.type !== 'dm') messages.push(await msg.reply('Проверьте личные сообщения.'));
    } catch (err) {
      messages.push(await msg.reply('Не могу отправить Вам личное сообщение. Возможно, ваш ЛС закрыт.'));
    }
    return messages;
  }
};
