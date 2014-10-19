'use strict';

(function() {
	// Omis Controller Spec
	describe('Omis Controller Tests', function() {
		// Initialize global variables
		var OmisController,
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

			// Initialize the Omis controller.
			OmisController = $controller('OmisController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Omi object fetched from XHR', inject(function(Omis) {
			// Create sample Omi using the Omis service
			var sampleOmi = new Omis({
				name: 'New Omi'
			});

			// Create a sample Omis array that includes the new Omi
			var sampleOmis = [sampleOmi];

			// Set GET response
			$httpBackend.expectGET('omis').respond(sampleOmis);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.omis).toEqualData(sampleOmis);
		}));

		it('$scope.findOne() should create an array with one Omi object fetched from XHR using a omiId URL parameter', inject(function(Omis) {
			// Define a sample Omi object
			var sampleOmi = new Omis({
				name: 'New Omi'
			});

			// Set the URL parameter
			$stateParams.omiId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/omis\/([0-9a-fA-F]{24})$/).respond(sampleOmi);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.omi).toEqualData(sampleOmi);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Omis) {
			// Create a sample Omi object
			var sampleOmiPostData = new Omis({
				name: 'New Omi'
			});

			// Create a sample Omi response
			var sampleOmiResponse = new Omis({
				_id: '525cf20451979dea2c000001',
				name: 'New Omi'
			});

			// Fixture mock form input values
			scope.name = 'New Omi';

			// Set POST response
			$httpBackend.expectPOST('omis', sampleOmiPostData).respond(sampleOmiResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Omi was created
			expect($location.path()).toBe('/omis/' + sampleOmiResponse._id);
		}));

		it('$scope.update() should update a valid Omi', inject(function(Omis) {
			// Define a sample Omi put data
			var sampleOmiPutData = new Omis({
				_id: '525cf20451979dea2c000001',
				name: 'New Omi'
			});

			// Mock Omi in scope
			scope.omi = sampleOmiPutData;

			// Set PUT response
			$httpBackend.expectPUT(/omis\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/omis/' + sampleOmiPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid omiId and remove the Omi from the scope', inject(function(Omis) {
			// Create new Omi object
			var sampleOmi = new Omis({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Omis array and include the Omi
			scope.omis = [sampleOmi];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/omis\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleOmi);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.omis.length).toBe(0);
		}));
	});
}());