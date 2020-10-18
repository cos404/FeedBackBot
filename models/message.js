const mongoose = require('../lib/mongoose');

const { Schema } = mongoose;
const messageSchema = new Schema({
  userId: {
    type: Number,
    required: true,
  },
  messageId: {
    type: Number,
    required: true,
    unique: true,
  },
  botMessageId: {
    type: Number,
    required: true,
    unique: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('message', messageSchema);
