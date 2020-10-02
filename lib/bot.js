const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

const bot = new TelegramBot(config.telegram.api_key, { polling: true });
module.exports = bot;
