const bot = require('./bot');
const config = require('../config');

const error = (type, err, data = null) => {
  if(type === 'tg') tg_handler(err, data);
  else if(type === 'mongo') mongo_handler(err, data);
};

const tg_handler = err => bot.sendMessage(config.telegram.abyss_id, `TG: ${err.response.body.description}`);
const mongo_handler = err => {
  if(err.code === 11000) return;
  else bot.sendMessage(config.telegram.abyss_id, `MONGO: [${err.name}]${err.message}`);
}

module.exports = error;
