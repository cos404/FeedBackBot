const mongoose = require('mongoose');
const config = require('../config');
const error = require('./errors_handler');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(config.mongoose.uri, err => {
  if (err) error('mongo', err);
  console.log('Successfully connected');
});

module.exports = mongoose;
