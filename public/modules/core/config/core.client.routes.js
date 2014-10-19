'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
])

.run(function($rootScope, $location, Authentication) {
	$rootScope.$watch(function() {
		return $location.path();
	}, function(newValue, oldValue) {
		if (Authentication.user && newValue === '/') {
			$location.path('/owers');
		}
	});
});