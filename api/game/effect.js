'use strict';

module.exports = function(state, cmd) {
  const command = cmd.command;
  const target = cmd.target;
  const value = cmd.value;
  const location = cmd.location;

  switch(command) {
    case "movePlayer":
      return movePlayer(state, location);
    case "remove":
      return remove(state, target);
    default:
      return state;
  }
}

function movePlayer(state, location) {
  state.player.room = location;
  return state;
}

function remove(state, target) {
  state.npc[target].room = undefined;
  return state;
}