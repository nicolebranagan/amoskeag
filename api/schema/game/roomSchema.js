'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  id : {
    type: String,
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
      label: {
        type: String,
      },
      dest: {
        type: String,
      }
    }
  ]
});

module.exports = mongoose.model('Rooms', RoomSchema);