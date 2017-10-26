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