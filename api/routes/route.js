'use strict';
module.exports = function(app) {
  const controller = require('../controllers/controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // test routes
  app.route('/saves/')
    .get(controller.read_all)
    .delete(controller.delete_all);
  
  app.route('/saves/new')
    .get(controller.create);

  app.route('/saves/:userId')
    .get(controller.read)
    .delete(controller.delete);

  app.route('/:userId/look')
    .get(controller.look)

  app.route('/:userId/move')
    .post(controller.move)

  app.route('/:userId/talk')
    .post(controller.talk)
};