/*
   Copyright 2017 Anders Riise Mæhlum

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/


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