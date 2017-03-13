var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Ifttthook = mongoose.model('Ifttthook');
var VirtualTile = mongoose.model('VirtualTile');
var http = require('http');

router.get('/', function (req, res, next) { // List all Ifttthooks
  Ifttthook.find({}).exec(function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

router.get('/:app', function (req, res, next) {  // List all Ifttthooks for an application
  Ifttthook.find({ application: req.params.app }).populate('application').populate('virtualTile').exec(function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

router.post('/:app/:tile', function (req, res, next) {  // Create (register) an Ifttthook
  var ifttthook = new Ifttthook({
    application: req.params.app,
    virtualTile: req.params.tile,
    triggerName: req.body.triggerName,
    trigger: req.body.trigger,
    properties: req.body.properties,
    outgoing: req.body.outgoing
  });

  ifttthook.save(function (err, ifttt) {
    if (err) return next(err);
    Ifttthook.populate(ifttt, [{ path: "virtualTile" }, { path: "application" }], function (err, iftttnew) {
      if (err) return next(err);
      res.json(iftttnew);
    })
  });
});

router.delete('/:app/hook/:id', function (req, res, next) { // Delete (unregister) an Ifttthook
  Ifttthook.findByIdAndRemove(req.params.id, function (err) {
    if (err) return next(err);
    res.status(204).end();
  });
});

router.post('/:app/hook/:id', function (req, res, next) {  // Post request to trigger incoming Ifttthooks by ID (used by IFTTT)
  var query = Ifttthook.findById(req.params.id).populate('virtualTile').populate('application');
  query.exec(function (err, hook) {
    if (err) return next(err);
    if (hook.outgoing || !hook.application.appOnline) return next();

    var data = JSON.stringify({
      name: hook.trigger,
      properties: hook.properties
    });

    var options = {
      port: 8080,

      path: '/resources/tiles/cmd/' + hook.application.user + '/' + hook.application._id + '/' + hook.virtualTile.tile,
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
    res.json(hook);
  });
});

/**
 * TODO: Remove this
 * Update a webhook
 */
// router.put('/:app/hook/:id', function (req, res, next) {
//   var postUrl = req.body.postUrl;
//   if (postUrl != null) {
//     Webhook.findByIdAndUpdate(req.params.id, { postUrl: postUrl }, { new: true }, function (err, webhook) {
//       if (err) return next(err);
//       if (webhook === null) res.status(404).end();
//       else res.json(webhook);
//     });
//   } else {
//     res.status(400).end();
//   }
// });

module.exports = router;