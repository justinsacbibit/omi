'use strict';

(function() {
	// Owers Controller Spec
	describe('Owers Controller Tests', function() {
		// Initialize global variables
		var OwersController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Owers controller.
			OwersController = $controller('OwersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Ower object fetched from XHR', inject(function(Owers) {
			// Create sample Ower using the Owers service
			var sampleOwer = new Owers({
				name: 'New Ower'
			});

			// Create a sample Owers array that includes the new Ower
			var sampleOwers = [sampleOwer];

			// Set GET response
			$httpBackend.expectGET('owers').respond(sampleOwers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.owers).toEqualData(sampleOwers);
		}));

		it('$scope.findOne() should create an array with one Ower object fetched from XHR using a owerId URL parameter', inject(function(Owers) {
			// Define a sample Ower object
			var sampleOwer = new Owers({
				name: 'New Ower'
			});

			// Set the URL parameter
			$stateParams.owerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/owers\/([0-9a-fA-F]{24})$/).respond(sampleOwer);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.ower).toEqualData(sampleOwer);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Owers) {
			// Create a sample Ower object
			var sampleOwerPostData = new Owers({
				name: 'New Ower'
			});

			// Create a sample Ower response
			var sampleOwerResponse = new Owers({
				_id: '525cf20451979dea2c000001',
				name: 'New Ower'
			});

			// Fixture mock form input values
			scope.name = 'New Ower';

			// Set POST response
			$httpBackend.expectPOST('owers', sampleOwerPostData).respond(sampleOwerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Ower was created
			expect($location.path()).toBe('/owers/' + sampleOwerResponse._id);
		}));

		it('$scope.update() should update a valid Ower', inject(function(Owers) {
			// Define a sample Ower put data
			var sampleOwerPutData = new Owers({
				_id: '525cf20451979dea2c000001',
				name: 'New Ower'
			});

			// Mock Ower in scope
			scope.ower = sampleOwerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/owers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/owers/' + sampleOwerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid owerId and remove the Ower from the scope', inject(function(Owers) {
			// Create new Ower object
			var sampleOwer = new Owers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Owers array and include the Ower
			scope.owers = [sampleOwer];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/owers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleOwer);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.owers.length).toBe(0);
		}));
	});
}());