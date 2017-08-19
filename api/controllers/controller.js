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
  Save.findOneAndUpdate(
    {id: req.params.userId},
    {last_date: Date.now()}, 
    function(err, save) {
      if (err)
        res.send(err);
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
    if (err)
      res.send(err);
    if (save.result.n == 0)
      res.json({ message: 'No such user', success: false })
    else
      res.json({ message: 'Successfully deleted', success: true});
  });
};