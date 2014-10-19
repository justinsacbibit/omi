'use strict';

// Owers controller
angular.module('owers').controller('OwersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owers',
	function($scope, $stateParams, $location, Authentication, Owers ) {
		$scope.authentication = Authentication;

		$scope.heading = function(ower) {
			var heading = ower.firstName + ' ' + (ower.lastName ? ower.lastName + ' ' : '');
			if (ower.balance === 0) {
				heading += 'does not owe you anything';
			} else {
				if (ower.balance < 0) {
					heading += 'is owed';
				} else {
					heading += 'owes you';
				}
				heading += ' $' + Math.abs(ower.balance);
			}
			return heading;
		};

		// Create new Ower
		$scope.create = function() {
			// Create new Ower object
			var ower = new Owers ({
				firstName: this.firstName,
				lastName: this.lastName
			});

			// Redirect after save
			ower.$save(function(response) {
				$location.path('owers/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message.message;
			});
		};

		// Remove existing Ower
		$scope.remove = function( ower ) {
			if ( ower ) { ower.$remove();

				for (var i in $scope.owers ) {
					if ($scope.owers [i] === ower ) {
						$scope.owers.splice(i, 1);
					}
				}
			} else {
				$scope.ower.$remove(function() {
					$location.path('owers');
				});
			}
		};

		// Update existing Ower
		$scope.update = function() {
			var ower = $scope.ower ;

			ower.$update(function() {
				$location.path('owers/' + ower._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message.message;
			});
		};

		// Find a list of Owers
		$scope.find = function() {
			$scope.owers = Owers.query();
		};

		// Find existing Ower
		$scope.findOne = function() {
			$scope.ower = Owers.get({
				owerId: $stateParams.owerId
			});
		};
	}
]);