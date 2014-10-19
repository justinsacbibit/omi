'use strict';

// Friends controller
angular.module('friends').controller('FriendsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Friends',
	function($scope, $stateParams, $location, Authentication, Friends ) {
		$scope.authentication = Authentication;

		$scope.heading = function(ower) {
			var name = ower.firstName ? ower.firstName + ' ' + (ower.lastName ? ower.lastName + ' ' : '') : ower.displayName;
			var heading = name;
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

		// Create new Friend
		$scope.create = function() {
			// Create new Friend object
			var friend = new Friends ({
				username: this.username
			});

			// Redirect after save
			friend.$save(function(response) {
				$location.path('friends/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Friend
		$scope.remove = function( friend ) {
			if ( friend ) { friend.$remove();

				for (var i in $scope.friends ) {
					if ($scope.friends [i] === friend ) {
						$scope.friends.splice(i, 1);
					}
				}
			} else {
				$scope.friend.$remove(function() {
					$location.path('owers');
				});
			}
		};

		// Update existing Friend
		$scope.update = function() {
			var friend = $scope.friend ;

			friend.$update(function() {
				$location.path('friends/' + friend._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Friends
		$scope.find = function() {
			$scope.friends = Friends.query();
		};

		// Find existing Friend
		$scope.findOne = function() {
			$scope.friend = Friends.get({
				friendId: $stateParams.friendId
			});
		};
	}
]);