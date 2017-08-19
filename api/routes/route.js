'use strict';
module.exports = function(app) {
  const userController = require('../controllers/userController');
  const gameController = require('../controllers/gameController');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // test routes
  app.route('/saves/')
    .get(userController.read_all)
    .delete(userController.delete_all);
  
  app.route('/saves/new')
    .get(userController.create);

  app.route('/saves/:userId')
    .get(userController.read)
    .delete(userController.delete);

  app.route('/:userId/look')
    .get(gameController.look)

  app.route('/:userId/move')
    .post(gameController.move)

  app.route('/:userId/talk')
    .post(gameController.talk)
};