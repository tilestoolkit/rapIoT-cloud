/** Getting WorkshopClient */
var WorkshopClient = require('../workshop-client');

// Required helper clients are initialized
var client = new WorkshopClient.TilesClient('Simone', '138.68.144.206', 1883).connect();
var reader = new WorkshopClient.EventReader();

// State parameters for Scenario1
var colorHex = ['FF0000', '00FF00', '0000FF', 'FFFFFF', 'F0F00F', 'A0A0FF', 'FF00FF'];
var ct = 0;

// On receive for client
client.on('receive', function(tileId, event) {
    console.log('Message received from ' + tileId + ': ' + JSON.stringify(event));

    // Define eventTile
    var eventTile = reader.readEvent(event, client);

    // Define tileA and tileB
    var tileA = reader.getTile("Tile_84", client);
    var tileB = reader.getTile("Tile_5c", client);
    var tileLED = reader.getTile("Tile_70", client);

    /**
     * Scenario description:
     * Single tap on TileA -> Set color on TileA.LED from array [red, green, blue, white]
     * Double tap on TileA -> Copy color to Philips HUE and TileB.LED && vibrate TileB and TileC
     */

    // Look at events on tileA
    if (eventTile.name === tileA.name) {
        // Loop through colors on LED on single tap
        if (eventTile.isSingleTap) {
            ct++;
            if (ct >= colorHex.length) {
                ct = 0;
            }
            tileA.ledOn(colorHex[ct]);
        }
    }

		if (eventTile.name === tileB.name) {
			if (eventTile.isSingleTap) {
				tileLED.ledOn(colorHex[ct]);
        console.log('here');
				//tileB.ledOn(colorHex[ct]);
				tileB.hapticBurst();
			}
		else if (eventTile.isDoubleTap){
			tileA.ledOff();
			//tileB.ledOff();
			tileLED.ledOff();
		}
    else if (eventTile.isTilt){
      tileLED.ledOn('rainbow');
    }

  }

});
