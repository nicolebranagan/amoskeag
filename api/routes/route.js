'use strict';
module.exports = function(app) {
  const userController = require('../controllers/userController');
  const saveController = require('../controllers/saveController');
  const gameController = require('../controllers/gameController');
  const auth = require("../auth/jwt-auth")();

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.removeHeader("X-Powered-By");
    next();
  });

  // test routes
  app.route('/users/')
    .get(userController.read_all)
    .delete(userController.delete_all);
  
  app.route('/users/new')
    .post(userController.create);

  app.route('/users/token')
    .get(userController.get_anonymous_token)
    .post(userController.get_token);

  app.get("/users/save", auth.authenticate(), function(req, res) {  
      res.json(req.user);
  });

  // test routes
  app.route('/saves/')
    .get(saveController.read_all)
    .delete(saveController.delete_all);

  app.route('/saves/:userId')
    .get(saveController.read)
    .delete(saveController.delete);

  app.options("/game/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
  });

  app.use('/game/*', auth.authenticate());
  
  app.route('/game/look')
    .get(gameController.look)
    .post(gameController.look_at)

  app.route('/game/move')
    .post(gameController.move)

  app.route('/game/talk')
    .post(gameController.talk)

  app.route('/game/status')
    .get(gameController.status)

  app.route('/game/get')
    .post(gameController.get)

  app.route('/game/use')
    .post(gameController.use)

  app.route('/game/save')
    .get(gameController.save)
    .post(gameController.save)

  app.route('/game/saves')
    .get(gameController.saves)

  app.route('/game/load')
    .post(gameController.load)

  app.all('*', function(req, res) {
    res.status(404).json({
      message: "Bad command or file name.",
      success: false
    });
  });
};