'use strict';

//Localomis service used to communicate Localomis REST endpoints
angular.module('localomis').factory('Localomis', ['$resource',
	function($resource) {
		return $resource('localomis/:localomiId', { localomiId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);