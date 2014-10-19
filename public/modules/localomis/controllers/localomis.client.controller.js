'use strict';

// Localomis controller
angular.module('localomis').controller('LocalomisController', ['$scope', '$stateParams', '$location', 'Authentication', 'Localomis',
	function($scope, $stateParams, $location, Authentication, Localomis ) {
		$scope.authentication = Authentication;

		// Create new Localomi
		$scope.create = function() {
			// Create new Localomi object
			var localomi = new Localomis ({
				name: this.name,
				amount: this.amount,
				note: this.note,
				owerId: $stateParams.owerId,
				direction: this.direction,
				type: this.type
			});

			// Redirect after save
			localomi.$save(function(response) {
				$location.path('localomis/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Localomi
		$scope.remove = function( localomi ) {
			if ( localomi ) { localomi.$remove();

				for (var i in $scope.localomis ) {
					if ($scope.localomis [i] === localomi ) {
						$scope.localomis.splice(i, 1);
					}
				}
			} else {
				$scope.localomi.$remove(function() {
					$location.path('localomis');
				});
			}
		};

		// Update existing Localomi
		$scope.update = function() {
			var localomi = $scope.localomi ;

			localomi.$update(function() {
				$location.path('localomis/' + localomi._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Localomis
		$scope.find = function() {
			$scope.localomis = Localomis.query({
				owerId: $stateParams.owerId
			});
		};

		// Find existing Localomi
		$scope.findOne = function() {
			$scope.localomi = Localomis.get({
				localomiId: $stateParams.localomiId
			});
		};

		$scope.direction = function direction(localomi) {
			if (localomi.type === 'omi') {
				if (localomi.direction === 'toOwer') {
					return 'lent';
				} else {
					return 'borrowed';
				}
			} else {
				if (localomi.direction === 'toOwer') {
					return 'paid';
				} else {
					return 'received';
				}
			}
		};
	}
]);