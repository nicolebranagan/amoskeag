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
  
  app.route('/saves/new')
    .get(saveController.create);

  app.route('/saves/:userId')
    .get(saveController.read)
    .delete(saveController.delete);

  app.use('/game/*', auth.authenticate());

  app.route('/game/look')
    .get(gameController.look)

  app.route('/game/move')
    .post(gameController.move)

  app.route('/game/talk')
    .post(gameController.talk)

  app.all('*', function(req, res) {
    res.status(404).json({
      message: "Bad command or file name.",
      success: false
    });
  });
};