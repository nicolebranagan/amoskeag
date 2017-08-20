'use strict';

const mongoose = require('mongoose'),
  Save = mongoose.model('Saves');
const uuidv4 = require('uuid/v4');
const game = require('../../game/game');

exports.read_all = function(req, res) {
  Save.find({}, function(err, saves) {
    if (err) {
      res.json({message: err.toString(), success: false})
        return;
    }
    res.json({
      saves: saves.map((e) => { return {
        id: e.id,
        last_date: e.last_date
      }}), 
      length: saves.length, 
      success: true
    });
  });
};

exports.delete_all = function(req, res) {
  Save.remove({}, function(err, save) {
    if (err) {
        res.json({message: err.toString(), success: false})
        return;
    }
    res.json({success: true});
  });
};

exports.read = function(req, res) {
  Save.findOneAndUpdate(
    {id: req.params.userId},
    {last_date: Date.now()}, 
    function(err, save) {
      if (err) {
        res.json({message: err.toString(), success: false})
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
      res.json({message: err.toString(), success: false})
      return;
    }
    if (save.result.n == 0)
      res.json({ message: 'No such user', success: false })
    else
      res.json({ message: 'Successfully deleted', success: true});
  });
};
