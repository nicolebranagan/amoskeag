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

  const room_guids = [];
  const room_ids = {};
  const new_rooms = [];
  for (const index in worldfile.rooms) {
    const guid = uuidv4();
    const room = worldfile.rooms[index];
    room_guids[index] = guid;
    room_ids[room.name] = index;

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
      exit.dest = room_guids[room_ids[exit.dest]];
    await new_room.save();
  }

  const dialogue_ids = [];
  const dialogue_id_from_name = {};
  const new_dialogues = [];
  for (const index in worldfile.dialogue) {
    const id = uuidv4();
    const dialogue = worldfile.dialogue[index];
    dialogue_ids[index] = id;
    if (dialogue.name)
      dialogue_id_from_name[dialogue.name] = index;
    const new_dialogue = new Dialogue(
      {
        id: index,
        guid: id,
        npc: dialogue.npc,
        text: dialogue.text,
      }
    )
    new_dialogues[index] = new_dialogue;
  }

  const get_dialogue = (data) => {
    if (isNaN(data))
      data = dialogue_id_from_name[data];
    return data;
  }

  const npc_ids = {};
  for (const index in worldfile.npc) {
    const npc = worldfile.npc[index];
    npc_ids[npc.name] = index;
    const new_npc = new Npc(
      {
        id : index,
        guid: uuidv4(),
        desc: npc.desc,
        dialogue: dialogue_ids[get_dialogue(npc.dialogue)],
        initial: {
          label: npc.label,
          room: room_ids[npc.initial.room]
        }
      }
    )
    await new_npc.save();
  }

  // Certain updates to dialogue require knowing information about the NPC loading, and the
  // NPC loading requires information about dialogue. Hence, this part comes after the NPC.
  for (const index in worldfile.dialogue) {
    const dialogue = worldfile.dialogue[index];
    const new_dialogue = new_dialogues[index];
    new_dialogue.npc = npc_ids[dialogue.npc];
    if (dialogue.parent !== undefined)
      new_dialogue.parent = get_dialogue(dialogue.parent);
    if (dialogue.children)
      new_dialogue.children = dialogue.children.map(
        (e) => ({
          label: e.label,
          guid: dialogue_ids[get_dialogue(e.id)]
        })
      )
    await new_dialogue.save();
  }
}

module.exports = function(callback) {
  load().then(callback);
}