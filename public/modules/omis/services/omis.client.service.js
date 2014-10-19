'use strict';

//Omis service used to communicate Omis REST endpoints
angular.module('omis').factory('Omis', ['$resource',
	function($resource) {
		return $resource('omis/:omiId', { omiId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);