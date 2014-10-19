'use strict';

// Owers controller
angular.module('owers').controller('OwersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Owers',
	function($scope, $stateParams, $location, Authentication, Owers ) {
		$scope.authentication = Authentication;

		// Create new Ower
		$scope.create = function() {
			// Create new Ower object
			var ower = new Owers ({
				name: this.name
			});

			// Redirect after save
			ower.$save(function(response) {
				$location.path('owers/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
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
				$scope.error = errorResponse.data.message;
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