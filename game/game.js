'use strict';

const worldfile = require("../data/worldfile");

exports.look = function(state) {
  const room = worldfile.rooms[state.room];
  const exits = [];
  for (const exit in room.exits)
    exits.push(exit);
  return { 
    output: {
      desc: room.desc,
      exits: exits
    }
  }
}

exports.move = function(state, direction) {
  const room = worldfile.rooms[state.room];
  if (!(direction in room.exits))
    throw "No such direction."
  return {
    output: { },
    update: {
      room: room.exits[direction]
    }
  }
}