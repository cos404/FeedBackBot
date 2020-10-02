module.exports = {
  telegram: {
    api_key: process.env.TELEGRAM_API_KEY,
    abyss_id: process.env.ABYSS_ID,
    feedback: process.env.FEEDBACK,
  },
  mongoose: {
    uri: process.env.MONGODB_URI,
  },
};
