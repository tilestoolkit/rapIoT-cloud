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

		$scope.env = {
			envs: [{ name: "Cloud" }, { name: "Local" }, { name: "Rule engine" }],
			selected: null
		}

		$scope.showNew = false;

		$scope.reset = function () {
			$scope._id = "";
			$scope.showNew = !$scope.showNew;
			$scope.user.selected = $scope.user.users[0];
			$scope.env.selected = $scope.env.envs[0];
			$scope.noAppOwner = false;
			$scope.noEnv = false;
			$scope.newName = false;
			$scope.application_form.$setUntouched();
			$scope.application_form.$setPristine();
		}

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
				if ($scope._id.toLowerCase() == app._id.toLowerCase()) {
					$scope.newName = true;
					check = true;
				}
			});
			if (check) {
				return;
			}

			// Create application
			applications.create($scope._id, $scope.env.selected.name, $scope.user.selected._id);

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

	.controller('ApplicationCtrl', ['$scope', '$location', 'application', 'applications', 'apphooks', function ($scope, $location, application, applications, apphooks) {
		$scope.application = application;

		// Workspace
		$scope.workspaceUrl = function(){
			return "http://" + $location.host() + ":" + $scope.application.port + "/ide.html";
		}
		$scope.workspaceState = function () {
			if ($scope.application.environmentOnline) {
				return "Stop hosting";
			}
			return "Start hosting";
		}
		$scope.workspaceClick = function () {
			applications.toggleHostApplication($scope.application);
		}

		// Application
		$scope.applicationState = function(){
			if($scope.application.appOnline){
				return "Stop application";
			}
			return "Start application"
		}
		$scope.toggleRunApplication = function(){
			applications.toggleRunApplication($scope.application);
		}

		// Virtual Tile
		$scope.addVirtualTileVisible = false;
		$scope.toggleAddVirtualTile = function () {
			$scope.addVirtualTileVisible = !$scope.addVirtualTileVisible;
		}
		$scope.addVirtualTile = function () {
			if (!$scope.vtName || $scope.vtName === '') return;
			applications.addVirtualTile(application, $scope.vtName);
			$scope.vtName = '';
			$scope.addVirtualTileVisible = false;
		}
		$scope.removeVirtualTile = function (vt) {
			applications.removeVirtualTile(application, vt);
		}

		// IFTTT key
		$scope.iftttkey = application.iftttkey;
		$scope.editIftttkey = false;
		$scope.toggleEditIftttkey = function () {
			$scope.editIftttkey = !$scope.editIftttkey;
		}
		$scope.setIftttkey = function () {
			$scope.editIftttkey = false;
			var fieldsToUpdate = { iftttkey: $scope.iftttkey };
			applications.update(application, fieldsToUpdate);
		}

		// IFTTT hooks
		$scope.iftttRule = {
			rules: [{ name: "IFTTT" }, { name: "Tile" }],
			selected: null
		};
		$scope.iftttRule.selected = $scope.iftttRule.rules[0];

		// if RULETYPE is TILE
		$scope.iftttTrigger = {
			triggers: [{ name: "Single tap" }, { name: "Double tap" }, { name: "Tilt" }],
			selected: null
		};
		$scope.iftttTile = {
			tiles: application.virtualTiles,
			selected: null
		};
		if (application.virtualTiles.length > 0) $scope.iftttTile.selected = $scope.iftttTile.tiles[0];
		$scope.iftttTrigger.selected = $scope.iftttTrigger.triggers[0];
		$scope.iftttTriggerName = '';
		$scope.getHookUrl = function (hook) {
			return "http://" + $location.host() + ":" + $location.port() + "/ifttt/" + hook.application._id + "/hook/" + hook._id;
		}

		// if RULETYPE is IFTTT
		$scope.iftttOperation = {
			ops: [{ name: "LED" }, { name: "Haptic" }],
			selected: null
		};
		$scope.iftttOperation.selected = $scope.iftttOperation.ops[0];

		$scope.iftttPropertyLed = {
			props: [{ name: "on" }, { name: "off" }],
			selected: null
		};
		$scope.iftttPropertyLed.selected = $scope.iftttPropertyLed.props[0];
		$scope.iftttPropertyColor = '';
		$scope.iftttPropertyHaptic = {
			props: [{ name: "long" }, { name: "burst" }],
			selected: null
		};
		$scope.iftttPropertyHaptic.selected = $scope.iftttPropertyHaptic.props[0];

		$scope.ifttthooks = apphooks.ifttthooks;
		$scope.addIfttthookVisible = false;
		$scope.toggleAddIfttthook = function () {
			$scope.addIfttthookVisible = !$scope.addIfttthookVisible;
		}
		$scope.addIfttthook = function () {
			if ($scope.iftttRule.selected.name == "Tile") {
				var trigger = "";
				var properties = [];
				if ($scope.iftttTrigger.selected.name == "Single tap") {
					trigger = "tap";
					properties.push("tap");
					properties.push("single");
				} else if ($scope.iftttTrigger.selected.name == "Double tap") {
					trigger = "tap";
					properties.push("tap");
					properties.push("double");
				} else {
					trigger = "tilt";
					properties.push("tilt");
				}
				apphooks.addIfttthook(application._id, $scope.iftttTile.selected._id, $scope.iftttTriggerName, trigger, properties, true);
			} else {
				var trigger = "";
				var properties = [];
				if ($scope.iftttOperation.selected.name == "LED") {
					trigger = "led";
					if ($scope.iftttPropertyLed.selected.name == "on") {
						properties.push("on");
						properties.push($scope.iftttPropertyColor);
					} else {
						properties.push("off");
					}
				} else {
					trigger = "haptic";
					properties.push($scope.iftttPropertyHaptic.selected.name);
				}
				apphooks.addIfttthook(application._id, $scope.iftttTile.selected._id, null, trigger, properties, false);
			}
			$scope.addIfttthookVisible = false;
		}
		$scope.removeIfttthook = function (hook) {
			apphooks.deleteIfttthook(hook);
		}

		// TILE hooks
		$scope.tilehooks = apphooks.tilehooks;
		$scope.removeTilehook = function (hook) {

		}
	}]);