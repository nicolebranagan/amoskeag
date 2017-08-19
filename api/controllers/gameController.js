'use strict';

const mongoose = require('mongoose'),
  Save = mongoose.model('Saves');
const uuidv4 = require('uuid/v4');
const game = require('../../game/game');

async function getUser(id) {
  const user = await Save.findOne({id: id});
  if (user == null)
    throw "No such user."
  return user.state;
}

async function update(id, update) {
  const user = await Save.findOne({id: id});
  if (user == null)
    throw "No such user."
  console.log(user.state.player.room)
  if ("player" in update) {
    if ("room" in update.player)
      user.state.player.room = update.player.room;
  }
  user.last_date = Date.now();
  await user.save();
} 

function takeAction(id, res, action) {
  const user = getUser(id).then(
    function(user) {
      if (user == null) {
        res.json({ message: 'No such user', success: false })
        return;
      }
      const see = action(user);
      if (see.update)
        update(id, see.update)
          .then(() => {;})
          .catch((err) => {throw err;});
      res.json(
        {
          output: see.output,
          success: true
        }
      )
  })
  .catch(
    function(err) {
      res.json({ message: err.toString(), success: false });
    }
  );
}

exports.look = function(req, res) {
  takeAction(req.params.userId, res,
    (user) => game.look(user)
  )
};

exports.move = function(req, res) {
  if (!req.body.exit)
    res.json(
      {
        message: "Where are you moving to?",
        success: false,
      }
    );
  else
    takeAction(req.params.userId, res,
      (user) => game.move(user, req.body.exit)
    )
}

exports.talk = function(req, res) {
  if (!req.body.talk)
    res.json(
      {
        message: "Who are you talking to?",
        success: false,
      }
    );
  else
    takeAction(req.params.userId, res,
      (user) => game.talk(user, req.body.talk)
    )
}