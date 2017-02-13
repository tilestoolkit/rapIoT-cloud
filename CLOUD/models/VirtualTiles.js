var mongoose = require('mongoose');

var VirtualTileSchema = new mongoose.Schema({
  virtualName: String,
  tile: { type: String, ref: 'Tile' },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
});

// VirtualTileSchema.plugin(autoincrement.plugin, 'VirtualTile');

mongoose.model('VirtualTile', VirtualTileSchema);