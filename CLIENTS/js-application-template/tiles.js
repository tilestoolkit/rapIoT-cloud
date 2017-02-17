var tilesLib = require('/tiles-lib');

var client = new tilesLib.TilesClient('Anders', '138.68.144.206', 1883).setApplication("{{appNameHolder}}").connect();
var reader = new tilesLib.EventReader();
// var PostmanClient = new tilesLib.PostmanClient('192.168.1.6', 3000);
// var IFTTTClient = new tilesLib.IFTTTClient('dncBS7n2aVGR4Bf44Yx9Ck');


client.on('receive', function (tileId, event) {
	// WORK HERE!
	
});