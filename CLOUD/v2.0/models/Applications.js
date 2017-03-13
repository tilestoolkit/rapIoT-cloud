var mongoose = require('mongoose');

var ApplicationSchema = new mongoose.Schema({
  _id: String,
  devEnvironment: String,
  environmentOnline: Boolean,
  appOnline: Boolean,
  port: Number,

  iftttkey: String,

  user: { type: String, ref: 'User' },
  virtualTiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' }]
});

ApplicationSchema.methods.addVirtualTile = function(vt, cb) {
	this.virtualTiles.addToSet(vt);
	this.save(cb);
}

mongoose.model('Application', ApplicationSchema);