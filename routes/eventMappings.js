/*
   Copyright 2017 Anders Riise Mæhlum, Varun Sivapalan & Jonas Kirkemyr

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
var EventMappings = mongoose.model('EventMappings');

/**
 * Get event mappings for specified user and Tile
 */
router.get('/:user/:tile', function(req, res, next) {
	EventMappings.findOne({user: req.params.user, tile: req.params.tile}).exec(function(err, doc){
    if (err) return next(err);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    if (doc == null) res.json({});
    else res.json(doc.eventMappings);
	});
});

/**
 * Create/replace event mappings for specified user and Tile
 */
router.post('/:user/:tile', function(req, res, next) {
  var newEventMappings = req.body.eventMappings;
  if (newEventMappings != null) {
    EventMappings.findOneAndUpdate({user: req.params.user, tile: req.params.tile}, { $set: { eventMappings: newEventMappings } }, {upsert: true, new: true}, function(err, eventMappings){
      if (err) return next(err);
      res.json(eventMappings);
    });
  } else {
    res.status(400).end();
  }
});

module.exports = router;