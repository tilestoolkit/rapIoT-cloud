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

router.get('/:app', function (req, res, next) {  // List all Tilehooks for an application
  Tilehook.find({ application: req.params.app }).populate('application').populate('virtualTile').populate('outputVirtualTile').exec(function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

module.exports = router;