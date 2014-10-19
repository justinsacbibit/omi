'use strict';

//Setting up route
angular.module('localomis').config(['$stateProvider',
	function($stateProvider) {
		// Localomis state routing
		$stateProvider.
		state('listLocalomis', {
			url: '/localomis',
			templateUrl: 'modules/localomis/views/list-localomis.client.view.html'
		}).
		state('createLocalomi', {
			url: '/localomis/create',
			templateUrl: 'modules/localomis/views/create-localomi.client.view.html'
		}).
		state('viewLocalomi', {
			url: '/localomis/:localomiId',
			templateUrl: 'modules/localomis/views/view-localomi.client.view.html'
		}).
		state('editLocalomi', {
			url: '/localomis/:localomiId/edit',
			templateUrl: 'modules/localomis/views/edit-localomi.client.view.html'
		});
	}
]);