'use strict';

const mongoose = require('mongoose'),
  Save = mongoose.model('Saves');
const uuidv4 = require('uuid/v4');
const game = require('../../game/game');

exports.read_all = function(req, res) {
  Save.find({}, function(err, saves) {
    if (err) {
        res.send(err);
        return;
    }
    const output = {saves: [], length: saves.length, success: true};
    for (const save of saves) {
      output.saves.push({
        id: save.id,
        last_date: save.last_date
      })
    }
    res.json(output);
  });
};

exports.delete_all = function(req, res) {
  Save.remove({}, function(err, save) {
    if (err) {
        res.send(err);
        return;
    }
    res.json({success: true});
  });
};

exports.create = function(req, res) {
  const new_game = new Save({id: uuidv4()});
  new_game.save(function(err, save) {
    if (err) {
      res.send(err);
      return;
    }
    save.state = game.initialState();
    save.save();
    res.json({
      id: save.id,
      success: true,
    });
  });
};

exports.read = function(req, res) {
  Save.findOneAndUpdate(
    {id: req.params.userId},
    {last_date: Date.now()}, 
    function(err, save) {
      if (err) {
        res.send(err);
        return;
      }
      if (save == null)
        res.json({ message: 'No such user', success: false })
      else
        res.json({
          id: save.id,
          last_date: save.last_date,
          success: true
      });
  });
};

exports.delete = function(req, res) {
  Save.remove({
    id: req.params.userId
  }, function(err, save) {
    if (err) {
      res.send(err);
      return;
    }
    if (save.result.n == 0)
      res.json({ message: 'No such user', success: false })
    else
      res.json({ message: 'Successfully deleted', success: true});
  });
};
