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


var mongoose = require('mongoose');

var TilehooksSchema = new mongoose.Schema({
    application: { type: String, ref: 'Application' },

    //Input Tile and properties
    virtualTile: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' },
    tigger: String,
    properties: [String],

    //Output Tile and properties
    outputVirtualTile: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' },
    outputTrigger: String,
    outputProperties: [String]
});

mongoose.model('Tilehook', TilehooksSchema);