'use strict';

const mongoose = require('mongoose'),
  Room = mongoose.model('Rooms'),
  Npc = mongoose.model('Npcs'),
  Dialogue = mongoose.model('Dialogues');
const helper = require("./helper");

exports.initialState = async function() {
  const npcdata = await Npc.find({});
  const npc = [];
  for (let i = 0; i < npcdata.length; i++) {
    npc.push(
      {
        id : npcdata[i].id,
        label: npcdata[i].initial.label,
        room : npcdata[i].initial.room,
        carryable: npcdata[i].initial.carryable
      }
    )
  }
  return {
    npc: npc
  }
}

exports.look = async function(state) {
  const room = await Room.findOne({id: state.player.room});
  const exits = room.exits;
  const npcs = state.npc
    .filter(e => e.room == state.player.room)
    .map(e => e.id);
  const npcdata = (await Npc.find({id: {$in: npcs}}))
    .map(
      e => ({
        label: state.npc[e.id].label,
        carryable: state.npc[e.id].carryable,
        guid: e.guid,
        dialogue: e.dialogue,
        desc: e.desc
      })
    )
  return { 
    output: {
      desc: room.desc + helper.npcString(npcdata.map(e => e.label)),
      exit: exits
              .map(e => ({label: e.label, exit: e.dest})),
      look: npcdata
              .filter(e => e.desc !== undefined)
              .map(e => ({label: e.label, id: e.guid})),
      talk: npcdata
              .filter(e => e.dialogue !== undefined)
              .map(e => ({label: e.label, id: e.dialogue})),
      get: npcdata
              .filter(e => e.carryable)
              .map(e => ({label: e.label, id: e.guid})),
    }
  }
}

exports.look_at = async function(state, target) {
  const npc = await Npc.findOne({guid: target})
  if (npc) {
    if (state.npc[npc.id].room !== state.player.room &&
        !(state.player.inventory.includes(npc.id)))
      throw "I don't see anyone here"
    return { 
      output: {
        desc: npc.desc
      }
    }
  }
  throw "That isn't here."
}

exports.move = async function(state, direction) {
  const room = await Room.findOne({id: state.player.room});
  const exit = room.exits.filter(
    (e) => e.dest == direction
  )
  if (exit.length == 0)
    throw "No such direction."
  const new_room = await Room.findOne({guid: direction})
  if (!new_room)
    throw "No such room."
  state.player.room = new_room.id;
  return {
    output: { },
    update: state
  }
}

exports.talk = async function(state, id) {
  const dialogue = await Dialogue.findOne({guid : id});
  if ((dialogue == null) ||
      (dialogue.parent !== undefined && !(dialogue.parent in state.seen_convo)))
    throw "Who are you talking to?"

  const npc = await Npc.findOne({id: dialogue.npc})
  if (!npc || state.npc[npc.id].room !== state.player.room)
    throw "I don't see anyone here"

  let talk = [];
  if (dialogue.children)
    talk = dialogue.children.map(
      e => ({
        "label": e.label,
        "id": e.guid
      })
    )
  state.seen_convo.push(dialogue.id);
  return {
    output: {
      desc: dialogue.text,
      talk: talk
    },
    update: state
  }
}

exports.status = async function(state) {
  const npcdata = (await Npc.find({id: {$in: state.player.inventory}}))
  return { 
    output: {
      inventory: npcdata
              .map(e => ({label: state.npc[e.id].label, look: e.guid})),
    }
  }
}

exports.get = async function(state, target) {
  const npc = await Npc.findOne({guid: target})
  if (!npc || state.npc[npc.id].room !== state.player.room)
    throw "I don't see that here"
  if (!state.npc[npc.id].carryable)
    throw "You can't get that."
  state.player.inventory.push(npc.id);
  return {
    output: {
      desc: "You take " + state.npc[npc.id].label + "."
    },
    update: state
  }
}

exports.use = async function(state, id, on) {
  const item = await Npc.findOne({guid: id});
  const target = await Npc.findOne({guid: on});

  if (!item || !(state.player.inventory.includes(item.id)))
    throw "You don't have that"
  if (!target || state.npc[target.id].room !== state.player.room)
    throw "That's not here."

  const use = item.use.find(e => e.target === target.id);
  if (!use)
    throw "Nothing happens."
  throw "Unimplemented."
}
