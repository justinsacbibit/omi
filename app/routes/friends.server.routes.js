'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');

	// Friends Routes
	app.route('/friends')
		.get(users.requiresLogin, users.users)
		.post(users.requiresLogin, users.addFriend);

	app.route('/friends/:friendId')
		.get(users.requiresLogin, users.read)
		.put(users.requiresLogin, users.update)
		.delete(users.requiresLogin, users.deleteFriend);

	// Finish by binding the Friend middleware
	app.param('friendId', users.userByID);
};