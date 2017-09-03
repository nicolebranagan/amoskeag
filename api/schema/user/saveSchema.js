'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SaveSchema = new Schema({
  id: {
    type: String
  },
  last_date: {
    type: Date,
    default: Date.now
  },
  state: 
  {
    player: {
      room: {
        type: Number,
        default: 0
      },
      inventory: [
        {
          type: Number,
          default: []
        }
      ]
    },
    npc: [
      {
        id: {
          type: String
        },
        label: {
          type: String,
        },
        room: {
          type: Number
        },
        carryable: {
          type: Boolean
        }
      }
    ],
    seen_convo: [
      {type: Number}
    ],
    endgame: {
      type: Number,
      default: -1
    }
  },
  saves: [{
    state: {},
    name: {
      type: String,
    },
    guid: {
      type: String
    }
  }]
});

module.exports = mongoose.model('Saves', SaveSchema);