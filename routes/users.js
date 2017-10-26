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
var User = mongoose.model('User');
var Tile = mongoose.model('Tile');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find(function(err, users){
    if(err){ return next(err); }
    res.json(users);
  });
});

router.post('/', function(req, res, next) {
  var user = new User(req.body);

  user.save(function(err, user){
    if(err){ return next(err); }
    res.json(user);
  });
});

router.param('user', function(req, res, next, id) {
  var query = User.findById(id).populate('tiles');

  query.exec(function (err, user){
    if (err) { return next(err); }
    if (!user) { return next(new Error('Can\'t find user.')); }

    req.user = user;
    console.log("user",user);
    return next();
  });
});

router.get('/:user', function(req, res) {
  res.json(req.user);
});

router.post('/:user/tiles', function(req, res) {
  var tileDeviceId = req.body.deviceId;
  req.user.addTile(tileDeviceId);
  res.json(req.user.tiles);
});

router.get('/:user/tiles', function(req, res, next) {
  res.json(req.user.tiles);
});

router.get('/:user/tiles/:id', function(req, res, next) {
    for(var index in req.user.tiles)//loop through user Tiles, to see if any tiles are found matching current ID
    {
        if(req.user.tiles[index]['_id']===req.params.id)
        {
            res.json(req.user.tiles[index]);
            return;
        }
    }
    res.json({"error":true,"message":"No tile found"});
});

router.delete('/:user/tiles/:id', function(req, res, next) {
    User.update({_id:req.user._id},{$pull:{'tiles':req.params.id}},function(error,data){//remove tile from user
        if(data.nModified)
            res.json({"success":true,"message":"Tile removed"});
        else
            res.json({"error":true,"message":"Couldn't find Tile to remove"});
    });
});

router.get('/:user/tiles/name/:name', function(req, res, next) {
  for (var i = 0; i < req.user.tiles.length; i++) { 
    if (req.user.tiles[i]['name'] === req.params.name) {
      res.json(req.user.tiles[i]);
      return;
    }
  }
  return next(err);
});

module.exports = router;
