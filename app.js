require('dotenv').config();

const config = require('./config');
const bot = require('./lib/bot');
const error = require('./lib/errors_handler');
const { User } = require('./models/index');
const tags = {
  bold: 'b',
  italic: 'i',
  underline: 'u',
  strikethrough: 's',
  code: 'code',
  pre: 'pre',
}

bot.on('message', async msg => {
  if(msg.entities && msg.entities[0].type === 'bot_command') return;
  const user = await User.findOne({ userId: msg.from.id }).catch(err => error('mongo', err));
  handleMsg(msg, user);
});

bot.onText(/\/start/, msg => {
  const { id: userId, username, first_name: firstname, language_code: language } = msg.from;
  const text = 'В данный момент Вы не анонимны и администраторы канала будут знать от кого сообщение. Если вам не нужен ответ и вы хотите сохранить анонимность нажмите на /anonymous.'
  createUser(userId, username, firstname, language);
  bot.sendMessage(userId, text, { parse_mode: 'Markdown' })
  .catch(err => error('tg', err));
});

bot.onText(/\/anonymous/, msg => {
  User.findOne({userId: msg.from.id})
  .then(user => {
    user.anonymous = !user.anonymous;
    user.save().catch(err => error('mongo', err));
    return user;
  })
  .then(user => {
    let isAnonymous = user.anonymous ? 'анонимны' : 'не анонимны';
    let text = `Теперь ваши сообщения ${isAnonymous}!`;
    bot.sendMessage(msg.from.id, text)
    .catch(err => error('tg', err));
  })
  .catch(err => error('mongo', err));
});

const createUser = async(userId, username, firstname, language) => {
  let user = new User({ userId, username, firstname, language});
  await user.save()
  .then(data => {
    if(data) return data;
  }).catch(err => error('mongo', err, { userId }));
}

const isPrivate = msg => msg.chat.type === 'private';
const getCommand = msg => msg.text.match(/^\/([a-zA-Z]+)/);
const setMediaGroup = (text, media_group_id) => {
  if(media_group_id) return `${media_group_id}${text ? (': ' + text) : ''}`;
  return text;
}
const textToMarkdown = (text, entities) => {
  if(!entities) return text;
  entities.sort((a, b) => {
    if (a.offset < b.offset) return 1;
    else if (a.offset > b.offset) return -1;
    else return 0;
  });

  entities.forEach(entity => {
    const regExp = new RegExp(`(.{${entity.offset}})(.{${entity.length}})(.+)?`);
    if(entity.type === 'text_link') {
      text = text.replace(regExp, `$1<a href="${entity.url}">$2</a>$3`);
    }
    else if(tags[entity.type]){
      const tag = tags[entity.type];
      text = text.replace(regExp, `$1<${tag}>$2</${tag}>$3`)
    }
  });

  return text;
};

const handleMsg = (msg, user) => {
  if(user.anonymous) anonymousMsg(msg);
  else notAnonymousMsg(msg);
};

const notAnonymousMsg = msg => {
  bot.forwardMessage(config.telegram.feedback, msg.chat.id, msg.message_id);
};

const anonymousMsg = msg => {
  const to = config.telegram.feedback;
  if(msg.document) {
    let text = textToMarkdown(msg.caption, msg.caption_entities);
    bot.sendDocument(to, msg.document.file_id, { caption: text, parse_mode: 'HTML' })
    .catch(err => error('tg', err));
  }
  else if(msg.photo) {
    const { photo } = msg;
    let text = setMediaGroup(textToMarkdown(msg.caption, msg.caption_entities), msg.media_group_id);
    bot.sendPhoto(to, photo[photo.length-1].file_id, { caption: text, parse_mode: 'HTML' })
    .catch(err => error('tg', err));
  }
  else if(msg.animation) {
    let text = textToMarkdown(msg.caption, msg.caption_entities);
    bot.sendAnimation(to, msg.animation.file_id, { caption: text, parse_mode: 'HTML' })
    .catch(err => error('tg', err));
  }
  else if(msg.video) {
    let text = setMediaGroup(textToMarkdown(msg.caption, msg.caption_entities), msg.media_group_id)
    bot.sendVideo(to, msg.video.file_id, { caption: text, parse_mode: 'HTML' })
    .catch(err => error('tg', err));
  }
  else if(msg.audio) {
    let text = textToMarkdown(msg.caption, msg.caption_entities);
    bot.sendAudio(to, msg.audio.file_id, { caption: text, parse_mode: 'HTML' })
    .catch(err => error('tg', err));
  }
  else if(msg.poll) {
    const { question, options } = msg.poll;
    let answers = options.map(option => { return option.text });
    bot.sendPoll(to, question, answers,  msg.poll)
    .catch(err => error('tg', err));
  }
  else if(msg.video_note) {
    bot.sendVideoNote(to, msg.video_note.file_id)
    .catch(err => error('tg', err));
  }
  else if(msg.voice) {
    bot.sendVoice(to, msg.voice.file_id)
    .catch(err => error('tg', err));
  }
  else if(msg.contact) {
    const { vcard, phone_number, last_name, first_name } = msg.contact;
    bot.sendContact(to, phone_number, first_name, { last_name, vcard })
    .catch(err => error('tg', err));
  }
  else if(msg.text) {
    bot
    .sendMessage(to, textToMarkdown(msg.text, msg.entities), { parse_mode: 'HTML' })
    .catch(err => error('tg', err));
  }
};
