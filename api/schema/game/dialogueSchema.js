'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DialogueSchema = new Schema({
  id : {
    type: String,
    required: true,
  },
  guid : {
    type: String,
    required: true
  },
  npc : {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true
  },
  parent: {
    type: String
  },
  children: [
    {
      label: {
        type: String,
      },
      guid: {
        type: String
      }
    }
  ]
});

module.exports = mongoose.model('Dialogues', DialogueSchema);