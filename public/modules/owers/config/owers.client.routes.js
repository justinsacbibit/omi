'use strict';

//Setting up route
angular.module('owers').config(['$stateProvider',
	function($stateProvider) {
		// Owers state routing
		$stateProvider.
		state('listOwers', {
			url: '/owers',
			templateUrl: 'modules/owers/views/list-owers.client.view.html'
		}).
		state('createOwer', {
			url: '/owers/create',
			templateUrl: 'modules/owers/views/create-ower.client.view.html'
		}).
		state('viewOwer', {
			url: '/owers/:owerId',
			templateUrl: 'modules/owers/views/view-ower.client.view.html'
		}).
		state('editOwer', {
			url: '/owers/:owerId/edit',
			templateUrl: 'modules/owers/views/edit-ower.client.view.html'
		});
	}
]);