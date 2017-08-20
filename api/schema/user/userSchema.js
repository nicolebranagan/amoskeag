'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  save_id: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Users', UserSchema);