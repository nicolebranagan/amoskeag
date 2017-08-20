'use strict';
const express = require('express'),
  app = express(),
  port = process.env.PORT || 9999,
  mongoose = require('mongoose'),
  Save = require('./api/schema/user/saveSchema'),
  User = require('./api/schema/user/userSchema'),
  Room = require('./api/schema/game/roomSchema'),
  Npc = require('./api/schema/game/npcSchema'),
  Dialogue = require('./api/schema/game/dialogueSchema'),
  bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Amoskeagdb'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./api/routes/route'); //importing route
routes(app); //register the route

require('./api/game/load')(
  (e) => {
    app.listen(port);
    console.log('Amoskeag server initialized at localhost:' + port);
  }
);

