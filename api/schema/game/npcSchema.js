'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NpcSchema = new Schema({
  id : {
    type: Number,
    required: true,
  },
  guid : {
    type: String,
    required: true,
  },
  desc: {
    type: String
  },
  dialogue: {
    type: String
  },
  initial: {
    label: {
      type: String,
      required: true
    },
    room: {
      type: String,
    }
  }
});

module.exports = mongoose.model('Npcs', NpcSchema);