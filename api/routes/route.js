'use strict';
module.exports = function(app) {
  let controller = require('../controllers/controller');

  // test routes
  app.route('/saves/')
    .get(controller.read_all)
    .post(controller.create);

  app.route('/saves/:userId')
    .get(controller.read)
    .delete(controller.delete);
};