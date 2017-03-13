var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Tilehook = mongoose.model('Tilehook');
var http = require('http');

router.get('/', function (req, res, next) { // List all Tilehooks
  Tilehook.find({}).exec(function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

router.get('/:app', function (req, res, next) {  // List all Tilehooks for application
  Tilehook.find({ application: req.params.app }).populate('application').populate('virtualTile').populate('outputVirtualTile').exec(function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

router.post('/:app', function (req, res, next) { // Create (register) a Tilehook
  var data = req.body;
  data.application = req.params.app;

  var tilehook = new Tilehook(data);

  tilehook.save(function (err, tile) {
    if (err) return next(err);
    Tilehook.populate(tile, [{ path: "virtualTile" }, { path: "outputVirtualTile" }, { path: "application" }], function (err, tilenew) {
      if (err) return next(err);
      res.json(tilenew);
    });
  });
});

router.delete('/:app/:id', function (req, res, next) { // Delete (unregister) a Tilehook
  Tilehook.findByIdAndRemove(req.params.id, function (err) {
    if (err) return next(err);
    res.status(204).end();
  });
});

module.exports = router;