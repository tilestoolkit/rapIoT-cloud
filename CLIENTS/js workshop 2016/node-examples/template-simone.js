var WorkshopClient = require('../workshop-client');

var client = new WorkshopClient.TilesClient('Simone', '138.68.144.206', 1883).connect();
var reader = new WorkshopClient.EventReader();


	

client.on('receive', function (tileId, event) {
	console.log(event);
	// WORK HERE!
	
	var tileA = reader.getTile("Tile_33", client);
	var tileB = reader.getTile("Tile_5c", client);
	
	tileA.hapticBurst();
	tileB.hapticBurst();
	
    var Tile = reader.readEvent(event, client);
    // Do something with event tile.

    // Example: if TILE is single tapped --> Turn on green LED
    if(Tile.isSingleTap){
      Tile.ledOn('blue');
	  Tile.ledOn('blue');
    }
    if(Tile.isDoubleTap){
      Tile.ledOff();
	 Tile.hapticBurst();
    }

});