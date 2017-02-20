var mongoose = require('mongoose');

var VirtualTileSchema = new mongoose.Schema({
  virtualName: String,
  tile: { type: String, ref: 'Tile' },
  application: { type: String, ref: 'Application' }
});

// VirtualTileSchema.plugin(autoincrement.plugin, 'VirtualTile');

mongoose.model('VirtualTile', VirtualTileSchema);