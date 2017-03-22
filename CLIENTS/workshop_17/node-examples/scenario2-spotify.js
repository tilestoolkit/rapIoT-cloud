/** Getting WorkshopClient */
var WorkshopClient = require('../workshop-client');

// Required helper clients are initialized
var client = new WorkshopClient.TilesClient('Simone', '138.68.144.206', 1883).connect();
var spotify = new WorkshopClient.SpotifyClient();
var reader = new WorkshopClient.EventReader();

// On receive for client
client.on('receive', function (tileId, event) {
	// Define eventTile
	var eventTile = reader.readEvent(event, client);

	// Define tileA
	var tileA = reader.getTile("Tile_5c", client);

	// Look at events on tileA
	if (eventTile.name === tileA.name) {
		if (eventTile.isSingleTap) {	// start music on single tap
			spotify.start();
		}
		else if (eventTile.isDoubleTap) {	// stop music on double tap
			spotify.stop();
		}
	}
});
