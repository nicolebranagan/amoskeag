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
    player : {
      room : 0
    },
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
              .map(e => ({label: e.label, href: "/game/look/" + e.guid})),
      talk: npcdata
              .filter(e => e.dialogue !== undefined)
              .map(e => ({label: e.label, href: "/game/talk/" + e.dialogue})),
      get: npcdata
              .filter(e => e.carryable)
              .map(e => ({label: e.label, href: "/game/get/" + e.guid})),
    }
  }
}

exports.look_at = async function(state, target) {
  console.log(target);
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
  return {
    output: { },
    update: {
      player: {
        room: new_room.id
      }
    }
  }
}

exports.talk = async function(state, id) {
  const dialogue = await Dialogue.findOne({guid : id});
  if ((dialogue == null) ||
      (dialogue.parent && !(dialogue.parent in state.seen_convo)))
    throw "Who are you talking to?"

  const npc = await Npc.findOne({id: dialogue.npc})
  if (!npc || state.npc[npc.id].room !== state.player.room)
    throw "I don't see anyone here"

  let talk = [];
  if (dialogue.children)
    talk = dialogue.children.map(
      e => ({
        "label": e.label,
        "href": "/game/talk/" + e.guid
      })
    )
  return {
    output: {
      desc: dialogue.text,
      talk: talk
    },
    update: {
      seen_convo: dialogue.id
    }
  }
}

exports.status = async function(state) {
  const npcdata = (await Npc.find({id: {$in: state.player.inventory}}))
  return { 
    output: {
      inventory: npcdata
              .map(e => ({label: state.npc[e.id].label, look: "/game/look/" + e.guid})),
    }
  }
}

exports.get = async function(state, target) {
  const npc = await Npc.findOne({guid: target})
  if (!npc || state.npc[npc.id].room !== state.player.room)
    throw "I don't see that here"
  if (!state.npc[npc.id].carryable)
    throw "You can't get that."

  return {
    output: {
      desc: "You take " + state.npc[npc.id].label + "."
    },
    update: {
      inventory: [[+1, npc.id]]
    }
  }
}
