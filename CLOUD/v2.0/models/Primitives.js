var mongoose = require('mongoose');

var PrimitiveSchema = new mongoose.Schema({
  isInputPrimitive: Boolean,
  name: String,
  properties: [String],
  hasCustomProp: Boolean
});

mongoose.model('Primitive', PrimitiveSchema);