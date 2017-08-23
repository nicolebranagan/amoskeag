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
  if (!update)
    return;
  const user = await Save.findOne({id: id});
  if (user == null)
    throw "No such user."
  user.state = update;
  return await user.save();
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
      update(id, result.update).then(()=>{});
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

exports.status = function(req, res) {
  takeAction(req.user.save, res,
    (state) => game.status(state)
  )
};

exports.look_at = function(req, res) {
  if (!req.body.id)
    res.status(422).json(
      {
        message: "Who are you looking at?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.look_at(state, req.body.id)
    )
}

exports.move = function(req, res) {
  if (!req.body.id)
    res.status(422).json(
      {
        message: "Where are you moving to?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.move(state, req.body.id)
    )
}

exports.talk = function(req, res) {
  if (!req.body.id)
    res.status(422).json(
      {
        message: "Who are you talking to?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.talk(state, req.body.id)
    )
}

exports.get = function(req, res) {
  if (!req.body.id)
    res.status(422).json(
      {
        message: "Who are you looking at?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.get(state, req.body.id)
    )
}

exports.use = function(req, res) {
  if (!req.body.id && !req.body.target)
    res.status(422).json(
      {
        message: "What are you using, and on what?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.use(state, req.body.id, req.body.target)
    )
}