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

	.controller('ApplicationCtrl', ['$scope', '$location', 'application', 'applications', 'apphooks', 'primitives',
	 function ($scope, $location, application, applications, apphooks, primitives) {
		$scope.application = application;
		$scope.iftttkey = application.iftttkey;

		$scope.primitives = primitives.primitives;
		$scope.ifttthooks = apphooks.ifttthooks;
		$scope.tilehooks = apphooks.tilehooks;
		

		/* Workspace functionality */
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

		/* Application functionality */
		$scope.applicationState = function(){
			if($scope.application.appOnline){
				return "Stop application";
			}
			return "Start application"
		}
		$scope.toggleRunApplication = function(){
			applications.toggleRunApplication($scope.application);
		}

		/* IFTTT key functionality */
		$scope.toggleEditIftttkey = function () {
			$scope.editIftttkey = !$scope.editIftttkey;
		}
		$scope.setIftttkey = function () {
			$scope.editIftttkey = false;
			var fieldsToUpdate = { iftttkey: $scope.iftttkey };
			applications.update(application, fieldsToUpdate);
		}

		/* Toggle views (only one should be visible at a time) */
		$scope.toggleView = function(view){
			var state = false;
			if(view == 'virtualtile'){
				state = $scope.addVirtualTileVisible;
			}else if(view == 'ifttthook'){
				state = $scope.addIfttthookVisible;
			}else if(view == 'tilehook'){
				state = $scope.addTilehookVisible;
			}

			$scope.resetForms();

			if(view == 'virtualtile'){
				$scope.addVirtualTileVisible = !state;
			}else if(view == 'ifttthook'){
				$scope.addIfttthookVisible = !state;
			}else if(view == 'tilehook'){
				$scope.addTilehookVisible = !state;
			}
		}

		/* Virtual Tiles functionality */
		$scope.addVirtualTile = function () {
			if (!$scope.vtName || $scope.vtName === '') return;
			applications.addVirtualTile(application, $scope.vtName);
			$scope.resetForms();
		}
		$scope.removeVirtualTile = function (vt) {
			applications.removeVirtualTile(application, vt);
		}

		

		/* IFTTThook functionality */
		$scope.iftttRule = { // Select direction of IFTTThook (in/out)
			rules: [{ name: "IFTTT" }, { name: "Tile" }],
			selected: null
		};
		$scope.inputPrimitive = { // Input Primitive select
			// Filter out unique name property of input primitives
			prims: primitives.primitives.filter(function(e){return e.isInputPrimitive;}),
			selected: null
		};
		$scope.inputTile = { // Input Tile (Virtual Tile)
			tiles: application.virtualTiles,
			selected: null
		};

		Array.prototype.customDistinct = function(){ // Get unique elements in array based on name property
			var newArray = [];
			var distinct = {};
			for(var i = 0; i<this.length; i++){
				if(this[i].name != distinct[name] ){
					distinct[name]=this[i].name;
					newArray.push(this[i]);
				}
			}
			return newArray;
		}

		$scope.outPrimitive = {	// Output Primitive select
			// Filter out unique name property of output primitives
			prims: primitives.primitives.filter(function(item){return !item.isInputPrimitive;}).customDistinct().map(function(e){return {name: e.name}}),
			selected: null
		};
		$scope.outPrimitiveUpdate = function(){
			// Filter out only properties[0] of output primitives where name is selected in inputPrimitive
			$scope.outPropertyOne.props = primitives.primitives.filter(function(e){return (!e.isInputPrimitive && e.name == $scope.outPrimitive.selected.name);}).map(function(e){return {name:e.properties[0]}});
			$scope.outPropertyOne.selected = $scope.outPropertyOne.props[0];
			$scope.outPropertyOneUpdate();
		}
		$scope.outPropertyOne = { props: [], selected: null }; // Output properties[0]
		$scope.outPropertyOneUpdate = function(){
			// Filter out properties[1] of output primitives where name and properties[0] is selected
			$scope.outPropertyTwo = primitives.primitives.filter(function(e){return (!e.isInputPrimitive && e.name == $scope.outPrimitive.selected.name && e.properties[0] == $scope.outPropertyOne.selected.name);}).map(function(e){return e.properties[1]})[0];
			// Filter out hasCustomProp of output primitives where name and properties[0] is selected
			$scope.hasCustomProp = primitives.primitives.filter(function(e){return (!e.isInputPrimitive && e.name == $scope.outPrimitive.selected.name && e.properties[0] == $scope.outPropertyOne.selected.name);}).map(function(e){return e.hasCustomProp})[0];
		}
		$scope.hasCustomProp = false;
		$scope.outPropertyTwo = null; // Output properties[1]
		$scope.outTile = { // Output Tile (Virtual Tile)
			tiles: application.virtualTiles,
			selected: null
		};

		$scope.inputField = null; // Input field

		/* Form reset */
		$scope.resetForms = function(){
			// Virtual Tile
			$scope.vtName = '';

			// Input
			$scope.iftttRule.selected = $scope.iftttRule.rules[0];
			$scope.inputPrimitive.selected = $scope.inputPrimitive.prims[0];
			$scope.inputTile.selected = $scope.inputTile.tiles[0];
			
			// Output
			$scope.outPrimitive.selected = $scope.outPrimitive.prims[0];
			$scope.outPrimitiveUpdate();
			$scope.outPropertyOneUpdate();
			$scope.outTile.selected = $scope.outTile.tiles[0];

			// input field
			$scope.inputField = null;

			// Hide views
			$scope.addVirtualTileVisible = false;			
			$scope.addIfttthookVisible = false;
			$scope.addTilehookVisible = false;
		}
		$scope.resetForms();

		// Get hook-url helper
		$scope.getHookUrl = function (hook) {
			return "http://" + $location.host() + ":" + $location.port() + "/ifttt/" + hook.application._id + "/hook/" + hook._id;
		}

		/* Hook adders */
		$scope.addIfttthook = function(){
			if($scope.iftttRule.selected.name == "Tile"){
				var prim = $scope.inputPrimitive.selected;
				apphooks.addIfttthook(application._id, $scope.inputTile.selected._id, $scope.inputField, prim.name, prim.properties, true)
			} else{
				var name = $scope.outPrimitive.selected.name;
				var props = [ $scope.outPropertyOne.selected.name ];
				if($scope.hasCustomProp) props.push($scope.outPropertyTwo);
				apphooks.addIfttthook(application._id, $scope.outTile.selected._id, $scope.inputField, name, props, false)
			}
			$scope.resetForms();
		}
		$scope.addTilehook = function(){
			var inPrim = $scope.inputPrimitive.selected;
			var outName = $scope.outPrimitive.selected.name;
			var outProps = [ $scope.outPropertyOne.selected.name ];
			if($scope.hasCustomProp) outProps.push($scope.outPropertyTwo);
			
			apphooks.addTilehook(application._id, $scope.inputTile.selected._id, inPrim.name, inPrim.properties, $scope.outTile.selected._id, outName, outProps);
			$scope.resetForms();
		}
		
		/* Hook removers */
		$scope.removeIfttthook = function (hook) {
			apphooks.deleteIfttthook(hook);
		}
		$scope.removeTilehook = function (hook) {
			apphooks.deleteTilehook(hook);
		}
	}])

	.controller('PrimitiveCtrl', ['$scope', 'primitives', function($scope, primitives){
		$scope.primitives = primitives.primitives;

		// Add new input primitive
		$scope.visibleInputPrim = false;
		$scope.toggleInputPrim = function(){
			resetInputs();
			$scope.visibleInputPrim = !$scope.visibleInputPrim;
		}
		$scope.iName, $scope.iPropOne, $scope.iPropTwo;
		resetInputs = function(){
			$scope.iName = null;
			$scope.iPropOne = null;
			$scope.iPropTwo = null;
		}
		$scope.iAddPrim = function(){
			console.log($scope.iName);
			console.log($scope.iPropOne);
			console.log("test");
			if(!$scope.iName || !$scope.iPropOne) return;
			addPrimitive(true, $scope.iName, [$scope.iPropOne, $scope.iPropTwo], false);
		}

		// Add new output primitive
		$scope.visibleOutputPrim = false;
		$scope.toggleOutputPrim = function(){
			resetOutputs();
			$scope.visibleOutputPrim = !$scope.visibleOutputPrim;
		}
		$scope.oName, $scope.oPropOne;
		$scope.oHasPropTwo = false;
		resetOutputs = function(){
			$scope.oName = null;
			$scope.oPropOne = null;
			$scope.oHasPropTwo = false;
		}
		$scope.oAddPrim = function(){
			if(!$scope.oName || !$scope.oPropOne) return;
			addPrimitive(false, $scope.oName, [$scope.oPropOne], $scope.oHasPropTwo);
		}

		// Add primitive
		addPrimitive = function(isInputPrimitive, name, properties, hasCustomProp){
			var data = JSON.stringify({
				isInputPrimitive: isInputPrimitive,
				name: name,
				properties: properties,
				hasCustomProp: hasCustomProp
			});
			primitives.create(data);
			resetInputs();
			resetOutputs();
			$scope.visibleInputPrim = false;
			$scope.visibleOutputPrim = false;
		}

		// Remove primitive
		$scope.removePrimitive = function(primitive){
			primitives.delete(primitive);
		}
	}]);