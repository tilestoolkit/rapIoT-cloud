var WorkshopClient = require('../workshop-client');

var client = new WorkshopClient.TilesClient('Simone', '138.68.144.206', 1883).connect();
var reader = new WorkshopClient.EventReader();




client.on('receive', function (tileId, event) {
	console.log(event);
	// WORK HERE!

	var tile33 = reader.getTile("Tile_33", client);
	var tile5C = reader.getTile("Tile_5c", client);
	var tile84 = reader.getTile("Tile_84", client);

	//tileA.hapticBurst();
	//tileB.hapticBurst();
    var eventTile = reader.readEvent(event, client);
    // Do something with event tile.

    // Example: if TILE is single tapped --> Turn on green LED
    if(eventTile.name === tile5C.name && eventTile.isSingleTap){
      tile84.ledOn('blue');
    }
    if(eventTile.name === tile5C.name && eventTile.isDoubleTap){
      tile84.ledOff();
    }

});
