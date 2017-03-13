var mongoose = require('mongoose');

var TilehooksSchema = new mongoose.Schema({
    application: { type: String, ref: 'Application' },

    //Input Tile and properties
    virtualTile: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' },
    tigger: String,
    properties: [String],

    //Output Tile and properties
    outputVirtualTile: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' },
    outputTrigger: String,
    outputProperties: [String]
});

mongoose.model('Tilehook', TilehooksSchema);