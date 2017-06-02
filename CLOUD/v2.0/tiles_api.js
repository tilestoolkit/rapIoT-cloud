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

var http = require('http');
var request = require('request');

var mongoose = require('mongoose');
var Webhook = mongoose.model('Webhook');
var Ifttthook = mongoose.model('Ifttthook');
var Tilehook = mongoose.model('Tilehook');

var tilesApi = {};

tilesApi.getTimestamp = function(){
	var d = new Date();
	return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + 'T'
		+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
}

tilesApi.setDeviceState = function(tileId, userId, appid, state, active, name){
	if (tileId == null) {
		console.log("Tile ID can't be undefined or null");
		return;	
	}

	var fieldsToSend = {}; // Only send fields that are defined and not null
	fieldsToSend.timestamp = tilesApi.getTimestamp();
	fieldsToSend.tileId = tileId;
  	if (userId != null) fieldsToSend.userId = userId;
  	if (state != null) {
  		try {
  			fieldsToSend.state = JSON.parse(state);
		} catch (e) {
			console.log('JSON Parse Error: ' + e);
			fieldsToSend.state = state;
		}
  	}
  	if (active != null) fieldsToSend.active = active;
  	if (name != null) fieldsToSend.name = name;

  	tilesApi.triggerMatchingWebhooks(tileId, userId, appid, fieldsToSend);
	tilesApi.triggerMatchingIfttthooks(tileId, appid, fieldsToSend);
	tilesApi.triggerMatchingTilehooks(tileId, appid, fieldsToSend);

	var data = JSON.stringify(fieldsToSend);
	console.log('POST: Sending device data: '+data);

	var options = {
	    port: 3000,
	    path: '/tiles',
	    method: 'POST',
	    headers: {
	        'Content-Type': 'application/json',
	        'Content-Length': Buffer.byteLength(data)
	    }
	};

	var req = http.request(options, function(res) {
	    res.setEncoding('utf8');
	    res.on('data', function (chunk) {
	        console.log("Response Body: " + chunk);
	    });
	});

	req.write(data);
	req.end();
}

tilesApi.deregister = function(topic){
	var splitTopic = topic.split('/');
	var tileId = splitTopic[splitTopic.length-1];

	var fieldsToSend = {tileId: tileId, timestamp: tilesApi.getTimestamp(), active: false, upsert: false};

	var data = JSON.stringify(fieldsToSend);
	console.log('POST: Sending device data: '+data);

	var options = {
	    port: 3000,
	    path: '/tiles',
	    method: 'POST',
	    headers: {
	        'Content-Type': 'application/json',
	        'Content-Length': Buffer.byteLength(data)
	    }
	};

	var req = http.request(options, function(res) {
	    res.setEncoding('utf8');
	    res.on('data', function (chunk) {
	        console.log("Response Body: " + chunk);
	    });
	});

	req.write(data);
	req.end();
}

tilesApi.triggerMatchingWebhooks = function(tileId, username, appid, event){
	console.log("Trigger matching webhooks called!")
	Webhook.find({user: username, tile: tileId, applicaton: appid}, function(err, docs) {
		if (!err){ 
	        console.log(docs);
	        for (var i = 0;i<docs.length;i++){
	        	console.log(docs[i].postUrl);
	        	tilesApi.triggerWebhook(docs[i].postUrl, event);
			}
	    } else { console.log(err); }
	});
}

tilesApi.triggerWebhook = function(url, data){
	request.post({
		url: url,
		json: data
	}, function(err, httpResponse, body){
		console.log("Sent " + JSON.stringify(data) + " to " + url);
		console.log("Response Body: " + body);
	});
}

tilesApi.triggerMatchingIfttthooks = function(tileId, appid, event){
	console.log("Trigger matching IFTTThooks called!");
	var query = Ifttthook.find({application: appid, outgoing: true}).populate('virtualTile').populate("application");
	
	query.exec(function(err, hooks){
		if(err){
			console.log(err);
			return;
		}
		for(var i = 0;i<hooks.length;i++){
			if(hooks[i].application.appOnline){
				if(hooks[i].virtualTile.tile == tileId){
					if(tilesApi.matchEventTrigger(hooks[i], event)){
						var postUrl = hooks[i].getPostUrl();
						console.log(postUrl);
						tilesApi.triggerWebhook(postUrl, event);
					}
				}
			}
		}
	});
}

tilesApi.triggerMatchingTilehooks = function(tileId, appid, event){
	console.log("Trigger matching Tilehooks called!");
	
	var query = Tilehook.find({application: appid}).populate('application').populate('virtualTile').populate('outputVirtualTile');

	query.exec(function(err, hooks){
		if(err){
			console.log(err);
			return;	
		}
		for(var i = 0;i<hooks.length;i++){
			if(hooks[i].application.appOnline){
				if(hooks[i].virtualTile.tile == tileId){
					if(tilesApi.matchEventTrigger(hooks[i], event)){
						tilesApi.triggerTilehook(hooks[i]);
					}
				}
			}
		}
	});
}

tilesApi.triggerTilehook = function(hook){
	var data = JSON.stringify({
      name: hook.outputTrigger,
      properties: hook.outputProperties
    });

    var options = {
      port: 8080,
      path: '/resources/tiles/cmd/' + hook.application.user + '/' + hook.application._id + '/' + hook.outputVirtualTile.tile,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    var hreq = http.request(options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log("Response Body: " + chunk);
      });
    });

    hreq.write(data);
}

tilesApi.matchEventTrigger = function(hook, event){
	console.log(event);
	if(!event || !event.state || !event.state.properties) return false;

	var properties = event.state.properties;

	if(properties[0]){
		if(!hook.properties[0]) return false;
		if(properties[0].trim() != hook.properties[0].trim()) {
			return false;
		}
	}
	if(properties[1]){
		if(!hook.properties[1]) return false;
		if(properties[1].trim() != hook.properties[1].trim()){
			return false;
		}
	}
	return true;
}

module.exports = tilesApi;
