'use strict';

const mongoose = require('mongoose'),
  Save = mongoose.model('Saves');
const uuidv4 = require('uuid/v4');
const game = require('../game/game');

function copyState(input) {
  if (!(input instanceof Array || input instanceof Object))
    return input;
  const output = input instanceof Array ? [] : {};
  for (const key in input) {
    if (key !== '_id')
      output[key] = copyState(input[key])
  }
  return output;
}

async function getUser(id) {
  const user = await Save.findOne({id: id.toString()});
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
      if (user.endgame !== -1)
        return game.endgame(user);
      else
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
      (state) => game.look_at(state, req.body.id.toString())
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
      (state) => game.move(state, req.body.id.toString())
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
      (state) => game.talk(state, req.body.id.toString())
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
      (state) => game.get(state, req.body.id.toString())
    )
}

exports.use = function(req, res) {
  if (!req.body.id)
    res.status(422).json(
      {
        message: "What are you using, and on what?",
        success: false,
      }
    );
  else
    takeAction(req.user.save, res,
      (state) => game.use(state, req.body.id.toString(), req.body.target ? req.body.target.toString() : null)
    )
}

exports.save = function(req, res) {
  const guid = uuidv4();
  Save.findOne({id: req.user.save}).then(
    function(user) {
      if (user == null) {
        res.json({ message: 'No such user', success: false })
        return;
      }
      const newstate = copyState(user.state.toObject());
      const name = req.body.name ? req.body.name : ("Save #" + user.saves.length.toString());
      user.saves.push(
        {
          guid: guid,
          state: newstate,
          name: name
        }
      )
      return user.save();
  })
  .then(
    function() {
      res.json({
        output: {id: guid},
        success: true
      })
  })
  .catch(
    function(err) {
      console.log(err)
      res.status(500).json({ message: err.toString(), success: false });
    }
  );
}

exports.saves = function(req, res) {
  Save.findOne({id: req.user.save}).lean().then(
    function(user) {
      if (user == null) {
        res.json({ message: 'No such user', success: false })
        return;
      }
      console.log(user)
      const saves = user.saves.map(
        e => ({
          name: e.name,
          id: e.guid
        })
      )
      res.json(
        {
          output: {
            saves: saves
          },
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

exports.load = function(req, res) {
  if (!req.body.id)
    res.status(422).json(
      {
        message: "No such save.",
        success: false,
      }
    );
  const guid = req.body.id;
  Save.findOne({id: req.user.save}).then(
    function(user) {
      if (user == null) {
        res.json({ message: 'No such user', success: false })
        return;
      }
      const save = user.saves.find(e => e.guid == guid);
      if (!save)
        throw "No such save"
      const newstate = copyState(save.state);
      user.state = newstate;
      return user.save();
  })
  .then(
    function() {
      res.json({
        output: {},
        success: true
      })
  })
  .catch(
    function(err) {
      console.log(err)
      res.status(500).json({ message: err.toString(), success: false });
    }
  );

}
