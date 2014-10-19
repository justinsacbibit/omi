'use strict';

// Configuring the Articles module
angular.module('omis').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'Omis', 'omis', 'dropdown', '/omis(/create)?');
		// Menus.addSubMenuItem('topbar', 'omis', 'List Omis', 'omis');
		// Menus.addSubMenuItem('topbar', 'omis', 'New Omi', 'omis/create');
	}
]);