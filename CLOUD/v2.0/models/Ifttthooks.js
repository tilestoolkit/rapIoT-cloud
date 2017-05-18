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

var IfttthooksSchema = new mongoose.Schema({
    triggerName: String,
    outgoing: Boolean,
    trigger: String,
    properties: [String],
    virtualTile: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualTile' },
    application: { type: String, ref: 'Application' },
});

IfttthooksSchema.methods.getPostUrl = function () {
    if (!this.application.iftttkey) return '';
    return "https://maker.ifttt.com/trigger/" + this.triggerName + "/with/key/" + this.application.iftttkey;
}

mongoose.model('Ifttthook', IfttthooksSchema);

/*
If 'outgoing' is true, then the 'trigger' and 'properties' will be used to match the input primitive from the Tile
    eg. trigger: 'tap', properties: ['tap', 'single']

if 'outgoing' is false, then the 'trigger' and 'properties' will be used as the output primitive to the Tile
    eg. trigger: 'led', properties: ['on', 'green']
 */