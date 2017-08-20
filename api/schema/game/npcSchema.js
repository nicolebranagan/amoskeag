'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NpcSchema = new Schema({
  id : {
    type: String,
    required: true,
  },
  label: {
    type: String
  },
  desc: {
    type: String
  },
  dialogue: {
    type: String
  },
  initial: {
    room: {
      type: String,
    }
  }
});

module.exports = mongoose.model('Npcs', NpcSchema);