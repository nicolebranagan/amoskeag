'use strict';

module.exports = function(state, cmd) {
  const command = cmd.command;
  const target = cmd.target;
  const value = cmd.value;
  switch(command) {
    case "has":
      return has(state, target);
    default:
      return state;
  }
}

function has(state, target) {
  return state.player.inventory.indexOf(target) != -1;
}