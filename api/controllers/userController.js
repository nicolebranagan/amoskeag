'use strict';

const mongoose = require('mongoose'),
  User = mongoose.model('Users'),
  Save = mongoose.model('Saves');
const uuidv4 = require('uuid/v4');
const jwt = require("jwt-simple");
const cfg = require('../../config');
const game = require('../game/game');
const bcrypt = require('bcrypt');

function new_game(id) {
  game.initialState()
  .then(function(state) {
    const new_game = new Save({
      id: id,
      state: state
    });
    return new_game.save()
  })
  .then(
    () => {}
  )
}

exports.get_anonymous_token = function(req, res) {
  const save_id = uuidv4();
  new_game(save_id);
  const payload = {
    save: save_id
  };
  const token = jwt.encode(payload, cfg.jwt.secret);
  res.json({
      token: token,
      anonymous: true,
      success: true
  });
}

exports.get_token = function(req, res) {  
  if (!(req.body.username && req.body.password))
    res.status(401).json({success: false});
  const name = req.body.username.toString();
  const password = req.body.password.toString();
  let user;
  User.findOne({name: name})
  .then(
    function(found) {
      if (!found) {
        res.status(401).json(
          {
            message: "No such user or password",
            success: false
          }
        )
        return;
      }
      user = found;
      return bcrypt.compare(password, user.password)
    }
  )
  .then(
    function(same) {
      if (same) {
        var payload = {
          user: user.id,
          save: user.save_id
        };
        var token = jwt.encode(payload, cfg.jwt.secret);
        res.json({
            token: token,
            anonymous: false,
            success: true
        });
      } else {
        res.status(401).json(
          {
            message: "No such user or password",
            success: false
          }
        )
      }
  })
  .catch(
    function(err) {
      res.status(401).json({ message: err.toString(), success: false });
    }
  );
}

exports.read_all = function(req, res) {
  User.find({}, function(err, users) {
    if (err) {
      res.json({message: err.toString(), success: false})
        return;
    }
    res.json({
      users: users.map((e) => { return {
        username: e.name,
        password: e.password,
        save_id: e.save_d
      }}), 
      length: users.length, 
      success: true
    });
  });
};

exports.delete_all = function(req, res) {
  User.remove({}, function(err, save) {
    if (err) {
        res.json({message: err.toString(), success: false})
        return;
    }
    res.json({success: true});
  });
};

exports.create = function(req, res) {
  if (!(req.body.username && req.body.password))
    res.status(422).json({
      message: "Please provide a username and password",
      success: false
    });
  const name = req.body.username.toString();
  const password = req.body.password.toString();
  const save_id = uuidv4();
  new_game(save_id);
  bcrypt.hash(password, cfg.bcrypt.rounds)
  .then(
    function(hash) {
      const new_user = new User({
        id: uuidv4(),
        name: name,
        password: hash,
        save_id: save_id
    })
    return new_user.save();
  })
  .then(
    function() {
      res.json({success: true})
    }
  )
  .catch(
    function(err) {
      res.status(401).json({ message: err.toString(), success: false });
    }
  );
};