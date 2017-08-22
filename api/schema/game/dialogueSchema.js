'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DialogueSchema = new Schema({
  id : {
    type: Number,
    required: true,
  },
  guid : {
    type: String,
    required: true
  },
  npc : {
    type: Number,
  },
  text: {
    type: String,
    required: true
  },
  parent: {
    type: Number
  },
  children: [
    {
      label: {
        type: String,
        required: true,
      },
      guid: {
        type: String,
        required: true
      }
    }
  ]
});

module.exports = mongoose.model('Dialogues', DialogueSchema);