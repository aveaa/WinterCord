/* eslint-disable no-underscore-dangle */
const util = require('util');
const discord = require('discord.js');
const tags = require('common-tags');

const { Command } = Commando;
const { RichEmbed } = require('discord.js');

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      group: 'util',
      memberName: 'eval',
      description: 'Выполняет JavaScript код.',
      details: 'Только разработчики могут выполнять эту команду.',
      ownerOnly: true,

      args: [
        {
          key: 'script',
          prompt: 'Какой код вы хотите выполнить?',
          type: 'string',
        },
      ],
    });

    this.lastResult = null;
  }

  run(msg, args) {
    // Make a bunch of helpers
    /* eslint-disable no-unused-vars */
    const message = msg;
    const { client } = msg;
    const objects = client.registry.evalObjects;
    const { lastResult } = this;
    const doReply = (val) => {
      if (val instanceof Error) {
        msg.reply(`Callback error: \`${val}\``);
      } else {
        const result = this.makeResultMessages(val, process.hrtime(this.hrStart));
        if (Array.isArray(result)) {
          for (const item of result) msg.reply(item);
        } else {
          msg.reply(result);
        }
      }
    };
    /* eslint-enable no-unused-vars */

    // Run the code and measure its execution time
    let hrDiff;
    try {
      const hrStart = process.hrtime();
      this.lastResult = eval(args.script);
      hrDiff = process.hrtime(hrStart);
    } catch (err) {
      return msg.reply(`Error while evaluating: \`${err}\``);
    }

    // Prepare for callback time and respond
    this.hrStart = process.hrtime();
    const result = this.makeResultMessages(this.lastResult, hrDiff, args.script);
    if (Array.isArray(result)) {
      return result.map(item => msg.reply(item));
    }
    return msg.reply(result);
  }

  makeResultMessages(result, hrDiff, input = null) {
    const inspected = util.inspect(result, { depth: 0 })
      .replace(nlPattern, '\n')
      .replace(this.sensitivePattern, '--snip--');
    const split = inspected.split('\n');
    const last = inspected.length - 1;
    const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
    const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'"
      ? split[split.length - 1]
      : inspected[last];
    const prepend = `\`\`\`javascript\n${prependPart}\n`;
    const append = `\n${appendPart}\n\`\`\``;
    if (input) {
      return discord.splitMessage(tags.stripIndents`
        *Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
        \`\`\`javascript
        ${inspected}
        \`\`\`
      `, { maxLength: 1900, prepend, append });
    }
    return discord.splitMessage(tags.stripIndents`
        *Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
        \`\`\`javascript
        ${inspected}
        \`\`\`
      `, { maxLength: 1900, prepend, append });
  }

  get sensitivePattern() {
    if (!this._sensitivePattern) {
      const { client } = this;
      let pattern = '';
      if (client.token) pattern += require('escape-string-regexp')(client.token);
      Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') });
    }
    return this._sensitivePattern;
  }
};
