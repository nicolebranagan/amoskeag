'use strict';

const worldfile = require("../../data/worldfile");
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose'),
  Room = mongoose.model('Rooms'),
  Dialogue = mongoose.model('Dialogues'),
  Npc = mongoose.model('Npcs');

async function load() {
  await Room.remove({});
  await Dialogue.remove({});
  await Npc.remove({});
  const room_ids = [];
  for (const index in worldfile.rooms) {
    const id = index;
    const room = worldfile.rooms[index];
    room_ids[index] = id;

    const new_room = new Room ({
      id: id,
      desc: room.desc,
      exits: Object.keys(room.exits).map(
        (e) => ({
          label: e,
          dest: room.exits[e]
        })
      )
    })
    await new_room.save();
  }

  const dialogue_ids = [];
  for (const index in worldfile.dialogue) {
    const id = uuidv4();
    const dialogue = worldfile.dialogue[index];
    dialogue_ids[index] = id;
    const new_dialogue = new Dialogue(
      {
        id: id,
        npc: dialogue.npc,
        text: dialogue.text,
        parent: dialogue.parent
      }
    )
    await new_dialogue.save();
  }

  const npc_ids = [];
  for (const index in worldfile.npc) {
    const id = index;
    const npc = worldfile.npc[index];
    npc_ids[index] = id;
    const new_npc = new Npc(
      {
        id : id,
        guid: uuidv4(),
        label: npc.label,
        desc: npc.desc,
        dialogue: dialogue_ids[npc.dialogue],
        initial: {
          room: room_ids[npc.initial.room]
        }
      }
    )
    await new_npc.save();
  }
}

module.exports = function(callback) {
  load().then(callback);
}