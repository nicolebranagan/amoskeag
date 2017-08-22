'use strict';

const mongoose = require('mongoose'),
  Save = mongoose.model('Saves');
const uuidv4 = require('uuid/v4');
const game = require('../game/game');

async function getUser(id) {
  const user = await Save.findOne({id: id});
  if (user == null)
    throw "No such user."
  return user.state;
}

async function update(id, update) {
  const user = await Save.findOne({id: id});
  if (!update)
    return;
  if (user == null)
    throw "No such user."
  if ("player" in update) {
    if ("room" in update.player)
      user.state.player.room = update.player.room;
  }
  if ("seen_convo" in update) {
    user.state.seen_convo.push(update.seen_convo)
  }
  user.last_date = Date.now();
  await user.save();
} 

function takeAction(id, res, action) {
  let result;
  getUser(id).then(
    function(user) {
      if (user == null) {
        res.json({ message: 'No such user', success: false })
        return;
      }
      return action(user);
  })
  .then(
    function(out) {
      result = out;
      return update(id, result.update);
  })
  .then(
    function() {
      res.json(
        {
          output: result.output,
          success: true
        }
      )
  })
  .catch(
    function(err) {
      res.status(500).json({ message: err.toString(), success: false });
    }
  );
}

exports.look = function(req, res) {
  takeAction(req.user.save, res,
    (state) => game.look(state)
  )
};

exports.look_at = function(req, res) {
  if (!req.params.lookId)
    res.status(422).json(
      {
        message: "Who are you talking to?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.look_at(state, req.params.lookId)
    )
}

exports.move = function(req, res) {
  if (!req.body.exit)
    res.status(422).json(
      {
        message: "Where are you moving to?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.move(state, req.body.exit)
    )
}

exports.talk = function(req, res) {
  if (!req.params.talkId)
    res.status(422).json(
      {
        message: "Who are you talking to?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.talk(state, req.params.talkId)
    )
}