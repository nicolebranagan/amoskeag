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
  state: 
  {
    player: {
      room: {
        type: Number,
        default: 0
      }
    },
    npc: [
      {
        id: {
          type: String
        },
        room: {
          type: Number
        }
      }
    ]
  }
});

module.exports = mongoose.model('Saves', SaveSchema);