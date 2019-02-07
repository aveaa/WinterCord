/**
 * Bot main class
 * @param {Discord.Client} this.client
 * @param {CommandHandler} this.CommandHandler
 * @type {module.Bot}
 */
module.exports = class Bot {
  constructor() {
    if (Bot.instance) return Bot.instance;
    Bot.instance = this;
    const _this = {};
    console.log(console.chalk`{greenBright.bold Bot class was initialized successfully}`);
    _this.client = new Discord.Client();
    _this.client.login(process.env.MainToken).catch((e) => {
      throw e;
    });
    _this.CommandHandler = require('./CommandHandler');
  }

  ready() {
    console.log(console.chalk`{greenBright.bold Bot was started successfully}`);
  }
};
