var WorkshopClient = require('../workshop-client');

// var client = new WorkshopClient.TilesClient('Anders', '178.62.99.218', 1883).setApplication("test_app").connect();
var client = new WorkshopClient.TilesClient('Anders', 'localhost', 1883).setApplication("test_app").connect();

var reader = new WorkshopClient.EventReader();
// var HueClient = new WorkshopClient.HueClient('PCz7eZwSifbpmLTQCdMVVvFEfC3MB7-odXvFAzC4');
// var PostmanClient = new WorkshopClient.PostmanClient('192.168.1.6', 3000);
// var IFTTTClient = new WorkshopClient.IFTTTClient('dncBS7n2aVGR4Bf44Yx9Ck');

client.on('receive', function (tileId, event) {
	// console.log(event);
	// WORK HERE!
	var et = reader.readEvent(event, client);

	console.log("'" + et.name + "' detected");
});