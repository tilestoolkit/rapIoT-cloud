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

"use strict";

var AbstractAscoltatore = require("ascoltatori/lib/abstract_ascoltatore");
var util = require("ascoltatori/lib/util");
var defer = util.defer;
var debug = require("debug")("ascoltatori:trie");
var Qlobber = require("qlobber").Qlobber;
var ascoltatori = require('ascoltatori/lib/ascoltatori');

var TilesApi = require('./tiles_api');

var tag = '[TILES Ascoltatore] '; // Log tag

function arrayBufferToString(buf){
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function TilesAscoltatore(settings) {
  AbstractAscoltatore.call(this, settings);

  settings = settings || {};

  this._matcher = new Qlobber({
    separator: settings.separator || '/',
    wildcard_one: settings.wildcardOne || '+',
    wildcard_some: settings.wildcardSome || '*'
  });

  // Application context
  this._matcher.add('tiles/evt/+/+/+/active', function(topic, message, options){
    var splitTopic = topic.split('/');
    var username = splitTopic[2];
    var appid = splitTopic[3];
    var deviceId = splitTopic[4];
    var active = (arrayBufferToString(message) === 'true');
    console.log(tag + "Set active state for " + deviceId + ": " + active + " (app)");
    TilesApi.setDeviceState(deviceId, username, appid, null, active);
  });

  this._matcher.add('tiles/evt/+/+/+/name', function(topic, message, options){
    var splitTopic = topic.split('/');
    var username = splitTopic[2];
    var appid = splitTopic[3];
    var deviceId = splitTopic[4];
    var name = arrayBufferToString(message);
    console.log(tag + "Register device with ID: " + deviceId + " and name: " + name + " (app)");
    TilesApi.setDeviceState(deviceId, username, appid, null, null, name);
  });

  this._matcher.add('tiles/evt/+/+/+', function(topic, message, options){
    var splitTopic = topic.split('/');
    var username = splitTopic[2];
    var appid = splitTopic[3];
    var deviceId = splitTopic[4];
    if(deviceId != 'name' && deviceId != 'active'){ // Sort out default context from old app (can be removed when old app is no longer being used...)
      var state = arrayBufferToString(message);
      console.log(tag + "Set event state for " + deviceId + ": " + state + " (app)");
      TilesApi.setDeviceState(deviceId, username, appid, state, null);
    }
  });

  this.emit("ready");
}

TilesAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

TilesAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();
  debug("registered new subscriber for topic " + topic);
  console.log(tag + "Registered new subscriber for topic '" + topic + "'");

  this._matcher.add(topic, callback);
  defer(done);
};

TilesAscoltatore.prototype.publish = function (topic, message, options, done) {
  this._raiseIfClosed();
  debug("new message published to " + topic);
  console.log("[TILES Ascoltatore] Message published to topic '"+topic+"': "+message);

  var cbs = this._matcher.match(topic);

  for (var i = 0; i < cbs.length; i++) {
    cbs[i](topic, message, options);
  }

  defer(done);
};

TilesAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();

  debug("deregistered subscriber for topic " + topic);
  console.log(tag + "Deregistered subscriber for topic '" + topic + "'");

  TilesApi.deregister(topic);

  this._matcher.remove(topic, callback);
  defer(done);
};

TilesAscoltatore.prototype.close = function close(done) {
  this._matcher.clear();
  this.emit("closed");

  debug("closed");
  console.log(tag + "Closed");

  defer(done);
};

TilesAscoltatore.prototype.registerDomain = function(domain) {
  debug("registered domain");
  console.log(tag + "Registered domain: " + domain);

  if (!this._publish) {
    this._publish = this.publish;
  }

  this.publish = domain.bind(this._publish);
};

util.aliasAscoltatore(TilesAscoltatore.prototype);

module.exports = TilesAscoltatore;