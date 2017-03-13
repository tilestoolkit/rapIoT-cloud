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