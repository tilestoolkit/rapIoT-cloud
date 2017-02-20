var mongoose = require('mongoose');

var WebhookSchema = new mongoose.Schema({
  postUrl: String,
  //event: String,
  user: { type: String, ref: 'User' },
  tile: { type: String, ref: 'Tile' },
  application: { type: String, ref: 'Application' }
});

mongoose.model('Webhook', WebhookSchema);