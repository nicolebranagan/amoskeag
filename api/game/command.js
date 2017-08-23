'use strict';

module.exports = function(state, cmd) {
  const command = cmd.command;
  const target = cmd.target;
  const value = cmd.value;

  switch(command) {
    case "remove":
      return remove(state, target);
    default:
      return state;
  }
}

function remove(state, target) {
  state.npc[target].room = undefined;
  return state;
}