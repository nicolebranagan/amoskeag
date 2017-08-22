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
  const new_rooms = [];
  for (const index in worldfile.rooms) {
    const guid = uuidv4();
    const room = worldfile.rooms[index];
    room_ids[index] = guid;

    const new_room = new Room ({
      id: index,
      guid: guid,
      desc: room.desc,
      exits: Object.keys(room.exits).map(
        (e) => ({
          label: e,
          dest: room.exits[e]
        })
      )
    })
    new_rooms[index] = new_room;
  }
  for (const index in worldfile.rooms) {
    const guid = uuidv4();
    const room = worldfile.rooms[index];
    const new_room = new_rooms[index];
    for (const exit of new_room.exits)
      exit.dest = room_ids[exit.dest]
    await new_room.save();
  }

  const dialogue_ids = [];
  const new_dialogues = [];
  for (const index in worldfile.dialogue) {
    const id = uuidv4();
    const dialogue = worldfile.dialogue[index];
    dialogue_ids[index] = id;
    const new_dialogue = new Dialogue(
      {
        id: index,
        guid: id,
        npc: dialogue.npc,
        text: dialogue.text,
        parent: dialogue.parent,
      }
    )
    new_dialogues[index] = new_dialogue;
  }
  for (const index in worldfile.dialogue) {
    const dialogue = worldfile.dialogue[index];
    const new_dialogue = new_dialogues[index];
    if (dialogue.children)
      new_dialogue.children = dialogue.children.map(
        (e) => ({
          label: e.label,
          guid: dialogue_ids[e.id]
        })
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
          room: npc.initial.room
        }
      }
    )
    await new_npc.save();
  }
}

module.exports = function(callback) {
  load().then(callback);
}