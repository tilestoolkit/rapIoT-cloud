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


var config = {};

config.cloud9 = {
    server: '/home/c9sdk/c9sdk/server.js',
    workspace: {
        root: '/home/c9sdk/',
    }
}

config.lib = {
    root: '/tiles-lib',
}

module.exports = config;