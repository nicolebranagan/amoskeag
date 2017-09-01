'use strict';

const worldfile = require(require('../../config').worldfile);
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
      title: room.title,
      desc: room.desc,
      exits: room.exits.map(
        (e) => ({
          guid: uuidv4(),
          label: e.label
        })
      )
    })
    new_rooms[index] = new_room;
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
        endgame: dialogue.endgame ? true : false,
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
  const new_npcs = [];
  for (const index in worldfile.npc) {
    const npc = worldfile.npc[index];
    npc_ids[npc.name] = index;
    const new_npc = new Npc(
      {
        id : index,
        guid: uuidv4(),
        desc: dialogue_ids[get_dialogue(npc.desc)],
        dialogue: dialogue_ids[get_dialogue(npc.dialogue)],
        initial: {
          label: npc.label,
          room: room_ids[npc.room],
          carryable: npc.carryable
        }
      }
    )
    new_npcs[index] = new_npc;
  }
  for (const index in worldfile.npc) {
    const npc = worldfile.npc[index];
    const new_npc = new_npcs[index];
    if (npc.use) {
      new_npc.use = npc.use.map(
        (e) => ({
          target: e.target ? npc_ids[e.target] : undefined,
          dialogue: dialogue_ids[get_dialogue(e.dialogue)]
        })
      )
    }
    await new_npc.save();
  }

  // Certain updates to dialogue and rooms require knowing information about the NPC loading,a
  // and the NPC loading requires information about dialogue and rooms.
  // Hence, this part comes after the NPC.
  for (const index in worldfile.rooms) {
    const guid = uuidv4();
    const new_room = new_rooms[index];
    const room = worldfile.rooms[index];
    new_room.exits.forEach((new_exit, index) =>{
      const exit = room.exits[index];
      new_exit.dest = room_ids[exit.dest];
      if (exit.condition)
        new_exit.condition = {
          command: exit.condition.command,
          target: npc_ids[exit.condition.target],
          value: exit.condition.value
        }
    });
    await new_room.save();
  }
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
          guid: dialogue_ids[get_dialogue(e.id)],
          condition: e.condition ? {
            command : e.condition.command,
            target: npc_ids[e.condition.target],
            value: e.condition.value
          } : undefined
        })
      )
    if (dialogue.effect)
      new_dialogue.effect = dialogue.effect.map(
        (e) => ({
          command: e.command,
          target: npc_ids[e.target],
          location: room_ids[e.location],
          value: e.value
        }))
    await new_dialogue.save();
  }
}

module.exports = function(callback) {
  load().then(callback);
}
