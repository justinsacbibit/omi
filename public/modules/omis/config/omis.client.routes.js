'use strict';

//Setting up route
angular.module('omis').config(['$stateProvider',
	function($stateProvider) {
		// Omis state routing
		$stateProvider.
		state('listOmis', {
			url: '/omis',
			templateUrl: 'modules/omis/views/list-omis.client.view.html'
		}).
		state('createOmi', {
			url: '/omis/create',
			templateUrl: 'modules/omis/views/create-omi.client.view.html'
		}).
		state('viewOmi', {
			url: '/omis/:omiId',
			templateUrl: 'modules/omis/views/view-omi.client.view.html'
		}).
		state('editOmi', {
			url: '/omis/:omiId/edit',
			templateUrl: 'modules/omis/views/edit-omi.client.view.html'
		});
	}
])

.run(function($rootScope, $location, Authentication) {
	$rootScope.$watch(function() {
		return $location.path();
	}, function(newValue, oldValue) {
		if (Authentication.user && newValue == '/') {
			$location.path('/omis');
		}
	});
});