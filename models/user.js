const mongoose = require('../lib/mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    default: '',
  },
  firstname: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum : ['banned', 'user', 'admin'],
    default: 'user',
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('user', userSchema);
