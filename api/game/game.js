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
        room : npcdata[i].initial.room
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
  const room = await Room.findOne(
    {id: state.player.room}
  );
  const exits = room.exits.map(e => e.label);
  const npcs = state.npc
    .filter(e => e.room == state.player.room)
    .map(e => e.id);
  const npcdata = (await Npc.find({id: {$in: npcs}}))
    .map(
      e => ({
        label: e.label,
        id: e.id,
        dialogue: e.dialogue
      })
    )
  return { 
    output: {
      desc: room.desc + helper.npcString(npcdata.map(e => e.label)),
      exit: exits,
      talk: npcdata.map(e => [e.label, e.id]),
      look: npcdata.map(e => [e.label, e.dialogue])
    }
  }
}

exports.move = async function(state, direction) {
  const room = await Room.findOne(
    {id: state.player.room}
  );
  const exit = room.exits.filter(
    (e) => e.label == direction
  )
  if (exit.length == 0)
    throw "No such direction."
  return {
    output: { },
    update: {
      player: {
        room: exit[0].dest
      }
    }
  }
}

exports.talk = async function(state, id) {
  const dialogue = await Dialogue.findOne(
    {id : id}
  );
  //TODO: Dialogue trees, and also making sure we can't skip ahead in them
  if (dialogue == null)
    throw "Who are you talking to?"

  return {
    output: {
      desc: dialogue.text,
      talk: []
    }
  }
}
