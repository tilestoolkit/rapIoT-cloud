var mongoose = require('mongoose');

var TilehooksSchema = new mongoose.Schema({
    //Input Tile and properties
    virtualTile: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' },
    tigger: String,
    properties: [String],

    //Output Tile and properties
    outputVirtualTile: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' },
    outputTrigger: String,
    outputProperties: [String],

    application: { type: String, ref: 'Application' }
});

mongoose.model('Tilehook', TilehooksSchema);