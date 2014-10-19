'use strict';

// Configuring the Articles module
angular.module('owers').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Owers', 'owers', 'dropdown', '/owers(/create)?');
		Menus.addSubMenuItem('topbar', 'owers', 'List Owers', 'owers');
		Menus.addSubMenuItem('topbar', 'owers', 'New Ower', 'owers/create');
	}
]);