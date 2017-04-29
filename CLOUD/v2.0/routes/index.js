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
var Tile = mongoose.model('Tile');
var User = mongoose.model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { appVersion: req.app.get('appVersion'), buildDate: req.app.get('buildDate') });
});

router.get('/tiles', function(req, res, next) {
  Tile.find(function(err, tiles){
    if(err){ return next(err); }
    res.json(tiles);
  });
});

router.post('/tiles', function(req, res, next) {
  var timestamp = req.body.timestamp;
  var tileId = req.body.tileId;  
  var userId = req.body.userId;
  var active = req.body.active;
  var state = req.body.state;
  var name = req.body.name;

  var upsert = req.body.upsert;
  if(upsert == null) upsert = true;

  var fieldsToUpdate = {}; // Only update fields that are defined and not null
  if (timestamp != null) fieldsToUpdate.timestamp = timestamp;
  if (userId != null) fieldsToUpdate.user = userId;
  if (active != null) fieldsToUpdate.active = active;
  if (state != null) fieldsToUpdate.state = state;
  if (name != null) fieldsToUpdate.name = name;

  Tile.findByIdAndUpdate(tileId, fieldsToUpdate, {upsert: upsert, new: true}, function(err, tile){
    if (err) return next(err);
    if (userId) {
      User.findByIdAndUpdate(userId, {}, {upsert: true, new: true}, function(err, user){
        user.addTile(tile, null);
      });
    }
    return res.json(tile);
  });
});

module.exports = router;
