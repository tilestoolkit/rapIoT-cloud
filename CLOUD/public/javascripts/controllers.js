/* Controllers */

angular.module('tilesApi.controllers', [])

	.controller('UsersCtrl', ['$scope', 'users', function($scope, users){
		$scope.users = users.users;
		
		$scope.addUser = function(){
			if(!$scope.username || $scope.username === '') return;
			users.create($scope.username);
			$scope.title = '';
			$scope.link = '';
		}
	}])

	.controller('UserCtrl', ['$scope', 'users', 'user', function($scope, users, user){
		$scope.user = user;
		$scope.tiles = user.tiles;

		$scope.addTile = function(){
			if(!$scope.tileDeviceId || $scope.tileDeviceId === '') return;
			users.addTile(user, $scope.tileDeviceId);
			$scope.tileDeviceId = '';
		}

		$scope.removeTile = function(tile){
			users.removeTile(user, tile);
		}
	}])

	.controller('TileCtrl', ['$scope', 'userId', 'tile', 'tileId', 'webhooks', function($scope, userId, tile, tileId, webhooks){
		$scope.userId = userId;
		$scope.tileId = tileId;
		$scope.tileName = tile.name;
		$scope.webhooks = webhooks.webhooks;

		$scope.addWebhook = function(){
			if(!$scope.webhookUrl || $scope.webhookUrl === '') return;
			webhooks.add(userId, tileId, $scope.webhookUrl);
			$scope.webhookUrl = '';
		}

		$scope.deleteWebhook = function(webhook){
			webhooks.delete(webhook);
		}
	}])

	.controller('ApplicationsCtrl', ['$scope', 'applications', 'users', function ($scope, applications, users) {
		$scope.applications = applications.applications;
		$scope.user = {
			users: users.users,
			selected: null
		}

		var envs =
			$scope.env = {
				envs: [{ name: "Cloud" }, { name: "Local" }],
				selected: null
			}

		$scope.showNew = false;

		$scope.reset = function () {
			$scope.name = "";
			$scope.showNew = !$scope.showNew;
			$scope.user.selected = $scope.user.users[0];
			$scope.env.selected = $scope.env.envs[0];
			$scope.noAppOwner = false;
			$scope.noEnv = false;
			$scope.newName = false;
			$scope.application_form.$setUntouched();
			$scope.application_form.$setPristine();
		}

		// $scope.applicationState = function (app) {
		// 	if (app.environmentOnline) {
		// 		return "Stop hosting";
		// 	}
		// 	return "Start hosting";
		// }
		// $scope.workspaceClick = function (app) {
		// 	applications.toggleHostApplication(app);
		// }


		$scope.addApplication = function () {
			// Validation
			if (!$scope.env.selected) {
				$scope.noEnv = true;
			}
			if (!$scope.user.selected) {
				$scope.noAppOwner = true;
			}
			if (!$scope.env.selected || !$scope.user.selected) {
				return;
			}
			var check = false;
			$scope.applications.forEach(function (app) {
				if ($scope.name.toLowerCase() == app.name.toLowerCase()) {
					$scope.newName = true;
					check = true;
				}
			});
			if (check) {
				return;
			}

			// Create application
			applications.create($scope.name, $scope.env.selected.name, $scope.user.selected._id);

			// reset view
			$scope.reset();
		}

		$scope.deleteApp = function (app) {
			$.confirm({
				title: 'Are you sure?',
				content: 'Deleting the application will also remove the cloud workspace repository and virtual tiles registered to the application (if any)!',
				buttons: {
					confirm: {
						text: 'Confirm',
						btnClass: 'btn-primary',
						action: function () {
							applications.delete(app);
						}
					},
					cancel: {
						text: 'Cancel',
						btnClass: 'btn-danger',
						keys: ['esc'],
						action: function () {
							// Do nothing
						}
					}
				}
			});
		}
	}])

	.controller('ApplicationCtrl', ['$scope', '$location', 'application', 'applications', function ($scope, $location, application, applications) {
		$scope.application = application;
		$scope.workspaceUrl = "http://" + $location.host() + ":" + application.port + "/ide.html";

		$scope.workspaceState = function () {
			if ($scope.application.environmentOnline) {
				return "Stop hosting";
			}
			return "Start hosting";
		}

		$scope.workspaceClick = function () {
			applications.toggleHostApplication($scope.application);
		}

		$scope.applicationState = function(){
			if($scope.application.appOnline){
				return "Stop application";
			}
			return "Start application"
		}
		$scope.toggleRunApplication = function(){
			applications.toggleRunApplication($scope.application);
		}

		$scope.addVirtualTile = function () {
			if (!$scope.vtName || $scope.vtName === '') return;
			applications.addVirtualTile(application, $scope.vtName);
			$scope.vtName = '';
		}
		$scope.removeVirtualTile = function (vt) {
			applications.removeVirtualTile(application, vt);
		}

	}]);