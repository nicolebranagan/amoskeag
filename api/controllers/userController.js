'use strict';

const mongoose = require('mongoose'),
  User = mongoose.model('Users'),
  Save = mongoose.model('Saves');
const uuidv4 = require('uuid/v4');
const jwt = require("jwt-simple");
const cfg = require('../../config');
const game = require('../game/game');
const bcrypt = require('bcrypt');

exports.get_anonymous_token = function(req, res) {
  const save_id = uuidv4();
  const new_game = new Save({id: save_id});
  new_game.save(function(err, save) {
    if (err) {
      res.json({message: err.toString(), success: false})
      return;
    }
    save.state = game.initialState();
    save.save();
    const payload = {
      save: save_id
    };
    const token = jwt.encode(payload, cfg.jwtSecret);
    res.json({
        token: token,
        anonymous: true,
        success: true
    });

  });
}

exports.get_token = function(req, res) {  
  if (!(req.body.username && req.body.password))
    res.status(401).json({success: false});
  const name = req.body.username;
  const password = req.body.password;
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
          save: user.save_id
        };
        var token = jwt.encode(payload, cfg.jwtSecret);
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
  const name = req.body.username;
  const password = req.body.password;
  const save_id = uuidv4();
  bcrypt.hash(password, 10)
  .then(
    function(hash) {
      const new_user = new User({
        name: name,
        password: hash,
        save_id: save_id
    })
    return new_user.save();
  })
  .then(
    function() {
      const new_game = new Save({id: save_id});
      new_game.save(function(err, save) {
        if (err) {
          res.json({message: err.toString(), success: false})
          return;
        }
        save.state = game.initialState();
        save.save();
        res.json({
          success: true,
        });
      });
  })
  .catch(
    function(err) {
      res.status(401).json({ message: err.toString(), success: false });
    }
  );
};