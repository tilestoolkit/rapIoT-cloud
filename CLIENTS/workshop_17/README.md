# Tiles WORKSHOP March 2017
This directory contains the workshop client APIs and scenarios created for the two workshops organized in March 2017

In order to use the WorkshopClient, run 'npm install' from your console in the workshop-client directory. This will install the necessary node packages for the client to run properly.

Navigate into the node-examples for example scenarios and template-api.

## WorkshopClient
The WorkshopClient will contain references to several helper client APIs that can be used in the client code to extend the IoT scenarios and facilitate development.

The structure of the WorkshopClient can be seen below. The regular TilesClient used to read tiles events is encapuslated into the WorkshopClient.

```json
workshopClient = {
  "TilesClient": TilesClient,
  "EventReader": EventReader,
  "HueClient": HueClient,
  "PostmanClient": PostmanClient,
  "IFTTTClient": IFTTTClient
};
```

### 1-TilesClient
This is the regular TilesClient that will allow to read events from the TILES Cloud

Example:
```javascript
var WorkshopClient = require('../workshop-client');
new WorkshopClient.TilesClient({username}, {serveraddress}, 1883).connect();

client.on('receive', function(tileId, event){
  // Do something with event
  
  // Example: if TILE is single tapped --> Turn on blue LED
  if(event.properties[0] === 'tap'){
    if(event.properties[1].startsWith('single'){
      client.send(client.tiles[event.name], 'led', 'on', 'blue');
    }
  }
});
```

The event will contain properties regarding name of the tile the event occured on, and the properties of the event. Reading events directly on the event object will require string comparison, as the event contains string properties.

### 2-EventReader
The EventReader was implemented to simplify the process of reading events and communicating with TILES Devices.
The EventReader will performe the string comparison on the event, and return an object with boolean properties for the event type.

Example:
```javascript
var WorkshopClient = require('../workshop-client');
var client = new WorkshopClient.TilesClient('Anders', '138.68.144.206', 1883).connect();
var reader = new WorkshopClient.EventReader();

client.on('receive', function(tileId, event){
  var eventTile = reader.readEvent(event, client);
  // Do something with event tile.
  
  // Example: if TILE is single tapped --> Turn on green LED
  if(eventTile.isSingleTap){
    eventTile.ledOn('green');
  }
});
```
In complex scenarios, this way of reading events will simplify the coding considerably.


