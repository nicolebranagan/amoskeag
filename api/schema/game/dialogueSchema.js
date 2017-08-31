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
  endgame: {
    type: Boolean,
    required: true
  },
  effect: [
    {
      command: {
        type: String,
        required: true
      },
      target: {
        type: Number
      },
      location: {
        type: Number
      },
      value: {
        type: String
      }
    }
  ],
  children: [
    {
      label: {
        type: String,
        required: true,
      },
      guid: {
        type: String,
        required: true
      },
      condition: {
        command: {
          type: String
        },
        target: {
          type: Number
        },
        value: {
          type: String
        }
      }
    }
  ]
});

module.exports = mongoose.model('Dialogues', DialogueSchema);