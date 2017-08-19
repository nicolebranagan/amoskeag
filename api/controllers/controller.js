'use strict';

let mongoose = require('mongoose'),
  Save = mongoose.model('Saves');

exports.read_all = function(req, res) {
  Save.find({}, function(err, save) {
    if (err)
        res.send(err);
    res.json(save);
  });
};

exports.create = function(req, res) {
  let new_game = new Save(req.body);
  new_game.save(function(err, save) {
    if (err)
      res.send(err);
    res.json(save);
  });
};

exports.read = function(req, res) {
  Save.findOne({id: req.params.userId}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.update = function(req, res) {
  Save.findOneAndUpdate({id: req.params.userId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.delete = function(req, res) {
  Save.remove({
    id: req.params.userId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Successfully deleted' });
  });
};