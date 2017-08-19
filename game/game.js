'use strict';

const worldfile = require("../data/worldfile");
const helper = require("./helper");
const uuidv4 = require('uuid/v4');

exports.initialState = function() {
  const npc = [];
  for (let i = 0; i < worldfile.npc.length; i++) {
    npc.push(
      {
        id : uuidv4(),
        room : worldfile.npc[i].initial.room
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

exports.look = function(state) {
  const room = worldfile.rooms[state.player.room];
  const exits = [];
  for (const exit in room.exits)
    exits.push(exit);
  const npc = worldfile.npc
    .reduce((a, e, i) => {
      if (state.npc[i].room === state.player.room) {
        a.push({
          desc: e.desc,
          id: state.npc[i].id
        });
      }
      return a;
    }, []);
  return { 
    output: {
      desc: room.desc + helper.npcString(npc.map(e => e.desc)),
      exit: exits,
      talk: npc.map(e => e.id)
    }
  }
}

exports.move = function(state, direction) {
  const room = worldfile.rooms[state.player.room];
  if (!(direction in room.exits))
    throw "No such direction."
  return {
    output: { },
    update: {
      player: {
        room: room.exits[direction]
      }
    }
  }
}

exports.talk = function(state, id) {
  const npc_index = state.npc.findIndex((e) => e.id == id);
  if (npc_index == -1)
    throw "We don't support dialog trees yet";
  if (state.npc[npc_index].room != state.player.room)
    throw "I don't see anyone like that here.";
  return {
    output: {
      desc: worldfile.npc[npc_index].dialogue,
      talk: []
    }
  }
}
