/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');

/**
 * @class CommandHandler
 * @type {module.CommandHandler}
 * @param {{id: string, name: string, description: string}} this.registeredGroups
 * @param {{trigger: string|RegExp, name: string, description: string, args: [{name: string, type: string|number, default: *=}], usage: [string], group: string|null, permissions: [{type: string|number, subtype: *=, value: *}], enabled: Boolean|string, run: function}} this.registeredCommands
 */
module.exports = class CommandHandler {
  constructor() {
    this.registeredGroups = [];
    this.registeredCommands = [];
  }

  registerCommand({
    trigger, name, description = '', args = [], usage = [], group = null, permissions = [], run,
  }) {
    try {
      if (this.registeredCommands.find(
        c => c.trigger.toString() === trigger.toString()
          || c.name === name
          || c.usage === usage,
      )) throw Error('Duplicate');
      if (!trigger || !name) throw Error('There is not trigger or name');
      if (typeof name !== 'string' || !(typeof trigger === 'string' || (typeof trigger === 'object' && trigger instanceof RegExp))) throw Error('Invalid type of trigger or name');
      if (group !== null && (typeof group !== 'string' || !this.registeredGroups.find(g => g.id === group))) throw Error('Cannot find such group');
      if (!run || typeof run !== 'function') throw Error('Cannot resolve run function');
      this.registeredCommands.push({
        trigger, name, description, args, usage, group, permissions, run,
      });
    } catch (e) {
      console.error(console.chalk`{bold.redBright There is an error occurred while registering command "${name}":}\n${e}`);
      return false;
    }
    console.log(console.chalk`{bold.greenBright Command "${name}" has been registered successfully}`);
    return true;
  }

  /**
   * Registers all commands from directory
   * @param {string} directory
   */
  registerFromDirectory(directory) {
    const files = fs.readdirSync(directory);
    files.forEach((fileName) => {
      try {
        const filePath = path.join(directory, fileName);
        const file = require(`./${filePath}`);
        this.registerCommand(file);
      } catch (e) {
        console.error(console.chalk`{bold.redBright There is an error occurred while registering file "${fileName}":}\n${e}`);
        return false;
      }
    });
  }
};
