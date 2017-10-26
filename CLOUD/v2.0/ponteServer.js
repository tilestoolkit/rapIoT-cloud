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

var ponte = require("ponte");

var tilesAscoltatore = require("./tiles_ascoltatore");

var opts = {
  logger: {
    level: 'info'
  },
  broker: {
    type: tilesAscoltatore
  },
  http: {
    port: 8080 // tcp
  },
  mqtt: {
    port: 1883 // tcp
  },
  coap: {
    port: 5683 // udp
  },
  persistence: {
    type: 'mongo',
    url: 'mongodb://localhost:27017/ponte'
  }
};
var server = ponte(opts);

server.on("updated", function(resource, buffer) {
  console.log("Resource Updated", resource, buffer);
});

// Stop the server after 1 minute
/*setTimeout(function() {
  server.close(function() {
    console.log("server stopped");
  });
}, 60 * 1000);*/

module.exports = server;