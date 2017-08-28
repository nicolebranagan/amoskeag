'use strict';

const mongoose = require('mongoose'),
  Room = mongoose.model('Rooms'),
  Npc = mongoose.model('Npcs'),
  Dialogue = mongoose.model('Dialogues');
const helper = require("./helper");
const effect = require("./effect.js")
const condition = require("./condition.js")

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

async function view(state, room) {
  const exits = room.exits
    .filter( e => (!e.condition) || (condition(state, e.condition)))
  const npcs = state.npc
    .filter(e => e.room == room.id)
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
        desc: room.desc + helper.npcString(npcdata.map(e => e.label)),
        exit: exits
                .map(e => ({label: e.label, id: e.guid})),
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

exports.look = async function(state) {
  const room = await Room.findOne({id: state.player.room});
  return {
    output: await view(state, room)
  }
}

exports.look_at = async function(state, target) {
  const npc = await Npc.findOne({guid: target})
  if (npc) {
    if (state.npc[npc.id].room !== state.player.room &&
        !(state.player.inventory.includes(npc.id)))
      throw "I don't see that here"
    if (!npc.desc)
      throw "Nothing interesting here."
    return exports.talk(state, npc.desc);
  }
  throw "That isn't here."
}

exports.move = async function(state, direction) {
  const room = await Room.findOne({id: state.player.room});
  const exit = room.exits.filter(
    (e) => e.guid === direction
  )
  if (exit.length === 0 || (exit.condition && !condition(state, exit.condition)))
    throw "No such direction."
  const new_room = await Room.findOne({id: exit[0].dest})
  if (!new_room)
    throw "No such room."
  state.player.room = new_room.id;
  return {
    output: {},
    update: state
  }
}

exports.talk = async function(state, id) {
  const dialogue = await Dialogue.findOne({guid : id});
  if ((dialogue == null) ||
      (dialogue.parent !== undefined && !(state.seen_convo.includes(dialogue.parent))))
    throw "Who are you talking to?"

  if (dialogue.npc !== undefined) {
    const npc = await Npc.findOne({id: dialogue.npc})
    if (!npc || state.npc[npc.id].room !== state.player.room)
      throw "I don't see anyone here"
  }

  if (dialogue.effect)
    state = dialogue.effect.reduce((a, e) => (a = effect(a, e)), state)

  let talk = [];
  if (dialogue.children)
    talk = dialogue.children
      .filter( e => (!e.condition) || (condition(state, e.condition)))
      .map(
        e => ({
          "label": e.label,
          "id": e.guid
        }))
  
  if (!state.seen_convo.includes(dialogue.id))
    state.seen_convo.push(dialogue.id);
  if (dialogue.endgame)
    state.endgame = dialogue.id;
  return {
    output: {
      desc: dialogue.text,
      talk: dialogue.endgame ? undefined : talk,
      endgame: dialogue.endgame ? true : undefined
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
  state.npc[npc.id].room = undefined;
  return {
    output: {
      desc: "You take " + state.npc[npc.id].label + "."
    },
    update: state
  }
}

exports.use = async function(state, id, on) {
  const item = await Npc.findOne({guid: id});

  if (!item || !(state.player.inventory.includes(item.id)))
    throw "You don't have that"
  
  let use;
  if (on) {
    const target = await Npc.findOne({guid: on});
    if (!target || state.npc[target.id].room !== state.player.room)
      throw "That's not here."
    use = item.use.find(e => e.target === target.id);
  } else {
    use = item.use.find(e => e.target === undefined);
  } 

  if (!use)
    throw "Nothing happens."
  return exports.talk(state, use.dialogue);
}

exports.endgame = async function(state) {
  const dialogue = await Dialogue.findOne({id : state.endgame});
  const output = (await exports.status(state)).output;
  output.desc = dialogue.text;
  output.endgame = true;

  return {
    output: output
  }
}
