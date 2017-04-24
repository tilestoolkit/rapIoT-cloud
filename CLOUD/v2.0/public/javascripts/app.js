/* Main module */

angular.module('tilesApi', ['ui.router', 'tilesApi.controllers', 'tilesApi.docs-controller', 'tilesApi.services'])

	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('home',{
				url: '/home',
				templateUrl: '/home.html'			
			})
			.state('users', {
				url: '/users',
				templateUrl: '/users.html',
				controller: 'UsersCtrl',
				resolve: {
					userPromise: ['users', function(users){
						return users.getAll();
					}]
				}
			})
			.state('user', {
				url: '/users/{id}',
				templateUrl: '/user.html',
				controller: 'UserCtrl',
				resolve: {
					user: ['$stateParams', 'users', function($stateParams, users) {
						return users.get($stateParams.id);
					}]
				}
			})
			.state('tiles', {
				url: '/users/{userId}/{tileId}',
				templateUrl: '/tile.html',
				controller: 'TileCtrl',
				resolve: {
					userId: ['$stateParams', function($stateParams) {
						return $stateParams.userId;
					}],
					tileId: ['$stateParams', function($stateParams) {
						return $stateParams.tileId;
					}],
					tile: ['$stateParams', 'tiles', function($stateParams, tiles) {
						return tiles.get($stateParams.userId, $stateParams.tileId);
					}],
					registeredWebhooksPromise: ['$stateParams', 'webhooks', function($stateParams, webhooks) {
						return webhooks.getRegistered($stateParams.userId, $stateParams.tileId);
					}]
				}
			})
			.state('applications',{
				url: '/applications',
				templateUrl: '/applications.html',
				controller: 'ApplicationsCtrl',
				resolve: {
					applicationPromise: ['applications', function(applications){
						return applications.getAll();
					}],
					userPromise: ['users', function(users){
						return users.getAll();
					}]
				}
			})
			.state('application', {
				url: '/applications/{applicationId}',
				templateUrl: '/application.html',
				controller: 'ApplicationCtrl',
				resolve: {
					application: ['$stateParams', 'applications', function($stateParams, applications){
						return applications.get($stateParams.applicationId);
					}],
					ifttthooksPromise: ['$stateParams', 'apphooks', function($stateParams, apphooks){
						return apphooks.getIfttthooks($stateParams.applicationId);
					}],
					tilehooksPromise: ['$stateParams', 'apphooks', function($stateParams, apphooks){
						return apphooks.getTilehooks($stateParams.applicationId);
					}],
					primitivePromise: ['primitives', function(primitives){
						return primitives.getAll();
					}]
				}
			})
			.state('primitives', {
				url: '/primitives',
				templateUrl: '/primitives.html',
				controller: 'PrimitiveCtrl',
				resolve: {
					primitivePromise: ['primitives', function(primitives){
						return primitives.getAll();
					}]
				}
			})
			.state('docs', {
				url: '/docs',
				templateUrl: '/docs.html',
				controller: 'DocsCtrl'
			})
			.state('docs2',{
				url: '/docs2',
				templateUrl: '/docs2.html',
				controller: 'DocsCtrl'
			})
			.state('docs3',{
				url: '/docs3',
				templateUrl: '/docs3.html',
				controller: 'DocsCtrl'
			})
			.state('docs4',{
				url: '/docs4',
				templateUrl: '/docs4.html',
				controller: 'DocsCtrl'
			})
			.state('docs5',{
				url: '/docs5',
				templateUrl: '/docs5.html',
				controller: 'DocsCtrl'
			})
			.state('docs6',{
				url: '/docs6',
				templateUrl: '/docs6.html',
				controller: 'DocsCtrl'
			});

		$urlRouterProvider.otherwise('home');
	}]);
	