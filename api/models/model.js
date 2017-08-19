'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SaveSchema = new Schema({
  id: {
    type: String,
    required: 'Please create a user ID'
  },
  last_date: {
    type: Date,
    default: Date.now
  },
  room: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Saves', SaveSchema);