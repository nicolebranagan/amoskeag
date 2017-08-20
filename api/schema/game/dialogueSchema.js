'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DialogueSchema = new Schema({
  id : {
    type: String,
    required: true,
  },
  text: {
    type: String
  },
  parent: {
    type: String
  }
});

module.exports = mongoose.model('Dialogues', DialogueSchema);