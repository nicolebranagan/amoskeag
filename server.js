'use strict';
const express = require('express'),
  app = express(),
  port = process.env.PORT || 9999,
  mongoose = require('mongoose'),
  Save = require('./api/schema/saveSchema'),
  User = require('./api/schema/userSchema'),
  bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Amoskeagdb'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./api/routes/route'); //importing route
routes(app); //register the route

app.listen(port);


console.log('Amoskeag server initialized at localhost:' + port);