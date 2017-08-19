'use strict';
module.exports = function(app) {
  let controller = require('../controllers/controller');

  // test routes
  app.route('/')
    .get(controller.read_all)
    .post(controller.create);


  //app.route('/:userId')
  //  .get(controller.read_save)
  //  .delete(controller.delete);
};