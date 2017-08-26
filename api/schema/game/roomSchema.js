'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  id : {
    type: Number,
    required: true,
  },
  guid: {
    type: String
  },
  desc: {
    type: String
  },
  exits: [
    {
      guid: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      dest: {
        type: Number,
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

module.exports = mongoose.model('Rooms', RoomSchema);