'use strict';

(function() {
	// Localomis Controller Spec
	describe('Localomis Controller Tests', function() {
		// Initialize global variables
		var LocalomisController,
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

			// Initialize the Localomis controller.
			LocalomisController = $controller('LocalomisController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Localomi object fetched from XHR', inject(function(Localomis) {
			// Create sample Localomi using the Localomis service
			var sampleLocalomi = new Localomis({
				name: 'New Localomi'
			});

			// Create a sample Localomis array that includes the new Localomi
			var sampleLocalomis = [sampleLocalomi];

			// Set GET response
			$httpBackend.expectGET('localomis').respond(sampleLocalomis);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.localomis).toEqualData(sampleLocalomis);
		}));

		it('$scope.findOne() should create an array with one Localomi object fetched from XHR using a localomiId URL parameter', inject(function(Localomis) {
			// Define a sample Localomi object
			var sampleLocalomi = new Localomis({
				name: 'New Localomi'
			});

			// Set the URL parameter
			$stateParams.localomiId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/localomis\/([0-9a-fA-F]{24})$/).respond(sampleLocalomi);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.localomi).toEqualData(sampleLocalomi);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Localomis) {
			// Create a sample Localomi object
			var sampleLocalomiPostData = new Localomis({
				name: 'New Localomi'
			});

			// Create a sample Localomi response
			var sampleLocalomiResponse = new Localomis({
				_id: '525cf20451979dea2c000001',
				name: 'New Localomi'
			});

			// Fixture mock form input values
			scope.name = 'New Localomi';

			// Set POST response
			$httpBackend.expectPOST('localomis', sampleLocalomiPostData).respond(sampleLocalomiResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Localomi was created
			expect($location.path()).toBe('/localomis/' + sampleLocalomiResponse._id);
		}));

		it('$scope.update() should update a valid Localomi', inject(function(Localomis) {
			// Define a sample Localomi put data
			var sampleLocalomiPutData = new Localomis({
				_id: '525cf20451979dea2c000001',
				name: 'New Localomi'
			});

			// Mock Localomi in scope
			scope.localomi = sampleLocalomiPutData;

			// Set PUT response
			$httpBackend.expectPUT(/localomis\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/localomis/' + sampleLocalomiPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid localomiId and remove the Localomi from the scope', inject(function(Localomis) {
			// Create new Localomi object
			var sampleLocalomi = new Localomis({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Localomis array and include the Localomi
			scope.localomis = [sampleLocalomi];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/localomis\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleLocalomi);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.localomis.length).toBe(0);
		}));
	});
}());