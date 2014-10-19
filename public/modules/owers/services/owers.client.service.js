'use strict';

//Owers service used to communicate Owers REST endpoints
angular.module('owers').factory('Owers', ['$resource',
	function($resource) {
		return $resource('owers/:owerId', { owerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);