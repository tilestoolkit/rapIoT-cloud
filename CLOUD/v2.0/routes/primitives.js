var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Primitive = mongoose.model('Primitive');
// var http = require('http');

router.get('/', function (req, res, next) { // List all Primitives
  Primitive.find({}).sort('isInputPrimitive').sort('name').exec(function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

router.post('/', function (req, res, next) { // Create (register) primitive
  var data = req.body;

  var primitive = new Primitive(data);

  primitive.save(function (err, prim) {
    if (err) return next(err);
    res.json(prim);
  });
});

router.delete('/:id', function (req, res, next) { // Delete Primitive
  var id = req.params.id;

  Primitive.findByIdAndRemove(id, function (err) {
    if (err) return next(err);
    res.status(204).end();
  });
});


module.exports = router;