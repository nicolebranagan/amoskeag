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
