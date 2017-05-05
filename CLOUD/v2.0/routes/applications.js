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
var Application = mongoose.model('Application');
var User = mongoose.model('User');
var VirtualTile = mongoose.model('VirtualTile');
var Tile = mongoose.model('Tile');
var Ifttthook = mongoose.model('Ifttthook');
var Tilehook = mongoose.model('Tilehook');
var exec = require('child_process').exec;
var portfinder = require('portfinder');
var replace = require('replace');
var os = require('os');

var config = require('../config');

// Helper: Start hosting workspace
var startHostingWorkspace = function (workspace, port, applicationId, callback) {
  var tag = "[ERROR Start hosting workspace] ";
  var uid = "wrk:" + applicationId;

  if (process.platform === "linux") {  // Only run on linux
    var usr = " ";
    var pwd = " ";
    exec("sudo -H -u c9sdk bash -c 'forever start --uid " + uid + " -a "
      + config.cloud9.server + " -p " + port
      + " -w " + config.cloud9.workspace.root + workspace
      + "/ -l 0.0.0.0 --auth " + usr + ":" + pwd + "'",
      function (error) {
        if (error) {
          console.log(tag + "Problem with hosting workspace");
          console.log(error);
          return;
        }
        callback();
      });
    return port;
  } else {
    console.log(tag + "Hosting workspace only available on linux");
  }
}
// Helper: Stop hosting workspace
var stopHostingWorkspace = function (applicationId, callback) {
  var tag = "[ERROR Stop hosting workspace] ";

  var uid = "wrk:" + applicationId;

  if (process.platform === "linux") {
    var cb = function (error) {
      if (error) {
        console.log(tag + "Problem with stopping service");
        console.log(error);
        return;
      }
      callback();
    }
    exec("sudo -H -u c9sdk bash -c 'forever stop " + uid + "'", cb);
  }
  else {
    console.log(tag + "Hosting workspace only available on linux");
  }
}
// Helper: Create workspace
var createWorkspace = function (workspace, username) {
  var tag = "[ERROR Creating workspace] ";
  if (process.platform === "linux") {
    exec("sudo -H -u c9sdk bash -c 'mkdir " + config.cloud9.workspace.root + workspace + "'", function (error) {
      if (error) {
        console.log(tag + "Problem creating workspace on linux");
        console.log(error);
        return;
      }
      var renameApp = function (error) {  // Callback for native 'exec' command below
        if (error) {
          console.log(tag + "Problem copying template files to workspace on linux");
          console.log(error);
          return;
        }
        var ipAddress = os.networkInterfaces().eth0[0].address;
        if (!ipAddress) ipAddress = '138.68.144.206';
        replace({
          regex: '{{tilesLibHolder}}',
          replacement: config.lib.root + '/api',
          paths: [config.cloud9.workspace.root + workspace],
          recursive: true,
          silent: true
        });
        replace({
          regex: '{{userNameHolder}}',
          replacement: username,
          paths: [config.cloud9.workspace.root + workspace],
          recursive: true,
          silent: true
        });
        replace({
          regex: '{{appNameHolder}}',
          replacement: workspace,
          paths: [config.cloud9.workspace.root + workspace],
          recursive: true,
          silent: true
        });
        replace({
          regex: '{{ipAddressHolder}}',
          replacement: ipAddress,
          paths: [config.cloud9.workspace.root + workspace],
          recursive: true,
          silent: true
        });
      }
      exec("sudo -H -u c9sdk bash -c 'cp " + config.lib.root + "/templates/* " + config.cloud9.workspace.root + workspace + "'", renameApp);
    });
  }
  else {
    console.log(tag + "Cloud workspace only available on linux");
  }
}
// Helper: Remove workspace
var removeWorkspace = function (workspace) {
  var tag = "[ERROR Remove workspace] ";
  if (process.platform === "linux") {
    exec("rm -r " + config.cloud9.workspace.root + workspace, function (error) {
      console.log(tag + "Problem with deleting workspace");
      console.log(error);
    });
  } else {
    console.log(tag + "Cloud workspace only available on linux");
  }
}
// Helper: Start application
var startApplication = function (workspace, applicationId, callback) {
  var tag = "[ERROR Starting application] ";
  var uid = "app:" + applicationId;

  if (process.platform === "linux") {
    exec("forever start --uid " + uid + " -a " + config.cloud9.workspace.root + workspace + "/tiles.js", function (error) {
      if (error) {
        console.log(tag + "Unable to start application as a service");
        console.log(error);
        return;
      }
      callback();
    });
  } else {
    console.log(tag + "Application hosting only on linux");
  }
}
// Helper: Stop application
var stopApplication = function (applicationId, callback) {
  var tag = "[ERROR Stopping application] ";
  var uid = "app:" + applicationId;

  if (process.platform === "linux") {
    exec("forever stop " + uid, function (error) {
      if (error) {
        console.log(tag + "Could not stop hosting application as a service");
        console.log(error);
      }
      callback();
    });
  } else {
    console.log(tag + "Application hosting only on linux");
  }
}
// Helper: Add VirtualTile to template
var addVirtualTileToTemplate = function (app, vt) {
  if (process.platform === "linux") {
    var replaceString = '/* AUTO GENERATED CODE START (do not remove) */';
    replace({
      regex: replaceString,
      replacement: replaceString
      + '/n' + 'var ' + vt.virtualName + ' = reader.getTile(\'' + vt.virtualName + '\', client);',
      paths: [config.cloud9.workspace.root + app],
      recursive: true,
      silent: true
    });
  }
}
// Helper: Remove VirtualTile from template
var removeVirtualTileFromTemplate = function (app, vt) {
  if (process.platform === "linux") {
    replace({
      regex: '/n' + 'var ' + vt.virtualName + ' = reader.getTile(\'' + vt.virtualName + '\', client);',
      replacement: '',
      paths: [config.cloud9.workspace.root + app],
      recursive: true,
      silent: true
    });
  }
}

// Check if name of app is valid
var isValidAppName = function (appName) {
  if (appName === undefined || appName == null || appName.length <= 0) return false;
  if (appName.indexOf(' ') >= 0) return false;
  return true;
}

router.get('/', function (req, res, next) { // Get all applications
  Application.find(function (err, apps) {
    if (err) { return next(err); }
    res.json(apps);
  });
});

router.post('/', function (req, res, next) { // Create a new application [will create workspace if c9sdk is configured on server]
  var application = new Application(req.body);
  if (!isValidAppName(application._id)) {
    return res.json(null);
  }

  if (req.body.devEnvironment === "Cloud") {
    createWorkspace(req.body._id, req.body.user); // Helper method
  }

  application.save(function (err, user) {
    if (err) { return next(err); }
    res.json(application);
  });
});

router.get('/user/:user', function (req, res, next) { // Get all applications for a user
  var userId = req.params.user;
  Application.find({ 'user': userId }, function (err, apps) {
    if (err) { return next(err); }
    res.json(apps);
  });
});

router.get('/jsapi', function (req, res, next) { // Get JS API as zip
  res.sendFile(config.lib.root + '/tiles-lib.zip');
});

router.param('app', function (req, res, next, id) { // Parameter for :app
  var query = Application.findById(id).populate('virtualTiles').populate('user');

  query.exec(function (err, app) {
    if (err) { return next(err); }
    if (!app) { return next(new Error('Can\'t find application.')); }

    var opts = {
      path: 'virtualTiles.tile',
      model: Tile
    }

    VirtualTile.populate(app, opts, function (err, fullApp) {
      if (err) { return next(err); }
      if (!fullApp) {
        req.application = app;
        return next(new Error('Can\'t populate virtual tiles in application'));
      }

      req.application = fullApp;
      return next();
    });
  });
});

router.get('/:app', function (req, res) { // Get app by id
  res.json(req.application);
});

router.post('/:app', function (req, res, next) { // Update app by id
  Application.findByIdAndUpdate(req.application._id, req.body, { new: true }, function (err, application) {
    if (err) return next(err);
    res.json(application);
  });
});

router.delete('/:app', function (req, res, next) { // Delete app and elements related to app
  Ifttthook.remove({ application: req.application._id }, function (err) { if (err) return next(err); }); // Remove Ifttthooks for this app
  Tilehook.remove({ application: req.application._id }, function (err) { if (err) return next(err); }); // Remove Tilehooks for this app
  VirtualTile.remove({ application: req.application._id }, function (err) { if (err) return next(err); }); // Remove Virtual Tiles for this app

  if (req.application.devEnvironment == 'Cloud') {
    if (req.application.environmentOnline) { // If workspace environment is being hosted, shut down before workspace is removed
      stopHostingWorkspace(req.application._id, function () { // Helper method
        removeWorkspace(req.application._id); // Helper method
      });
    } else {
      removeWorkspace(req.application._id); // Helper method
    }
  }

  Application.findByIdAndRemove(req.application._id, function (err) {
    if (err) return next(err);
    res.status(204).end();
  }); // Application removed from mongoDB
});

router.get('/:app/host/workspace', function (req, res, next) { // Toggle workspace hosting
  var app = req.application;
  if (app.devEnvironment !== 'Cloud') {
    res.status(400).end;
    return;
  }

  if (!app.environmentOnline) {  // Start hosting workspace
    portfinder.getPort(function (err, port) {
      if (err) return next(err);

      var callback = function () {
        Application.findByIdAndUpdate(app._id, { environmentOnline: true, port: port }, { new: true }, function (err, application) {
          if (err) return next(error);
          res.json(application);
        });
      }

      startHostingWorkspace(app._id, port, app._id, callback); // Helper method
    });

  } else {  // Stop hosting workspace
    var callback = function () {
      Application.findByIdAndUpdate(app._id, { environmentOnline: false, port: 0 }, { new: true }, function (err, application) {
        if (err) return next(error);
        res.json(application);
      });
    }
    stopHostingWorkspace(app._id, callback); // Helper method
  }
});

router.get('/:app/host/app', function (req, res, next) { // Toggle app hosting
  var app = req.application;

  if (!app.appOnline) {  // Start hosting app
    var callback = function () {
      return Application.findByIdAndUpdate(app._id, { appOnline: true }, { new: true }, function (err, application) {
        if (err) return next(error);
        res.json(application);
      });
    }
    if (app.devEnvironment == 'Cloud') {
      startApplication(app._id, app._id, callback); // Helper method
    } else {
      callback();
    }

  } else {  // Stop hosting app
    var callback = function () {
      return Application.findByIdAndUpdate(app._id, { appOnline: false }, { new: true }, function (err, application) {
        if (err) return next(error);
        res.json(application);
      });
    }
    if (app.devEnvironment == 'Cloud') {
      stopApplication(app._id, callback); // Helper method
    } else {
      callback();
    }
  }
});

router.post('/:app/virtualTile', function (req, res) { // Add Virtual Tile to application
  var virtualName = req.body.virtualName;
  var vt = new VirtualTile({ virtualName: virtualName, application: req.application._id, tile: null });
  vt.save(function (err, vt) {
    if (err) { return next(err); }
    req.application.addVirtualTile(vt._id);
    addVirtualTileToTemplate(req.application._id, vt); // Call helper method to add to template if it exists
    return res.json(vt);
  });
});

router.delete('/:app/virtualTile/:id', function (req, res, next) { // Delete Virtual Tile from application
  var vtId = req.params.id;
  Ifttthook.remove({ virtualTile: vtId }, function (err) { if (err) return next(err); }) // Remove Ifttthook registered to this virtual tile
  Tilehook.remove({ virtualTile: vtId }, function (err) { if (err) return next(err); }) // Remove Tilehook registered to this virtual tile
  Tilehook.remove({ outputVirtualTile: vtId }, function (err) { if (err) return next(err); }) // Remove Tilehook where this virtial tile is output tile

  VirtualTile.findByIdAndRemove(vtId, function (err, vt) { // Remove virtual tile
    if (err) return next(err);
    removeVirtualTileFromTemplate(req.application._id, vt); // Call helper method to remove from template if it exists
  });
  Application.update({ _id: req.application._id }, { $pull: { 'virtualTiles': req.params.id } }, function (error, data) {//remove virtualTile from application
    if (data.nModified)
      res.json({ "success": true, "message": "Virtual Tile removed" });
    else
      res.json({ "error": true, "message": "Couldn't find Virtual Tile to remove" });
  });
});

router.post('/:app/:id', function (req, res) { // Update (pair) physical Tile to Virtual Tiles
  var virtualTileId = req.params.id;
  var tileId = req.body.tile;

  var findVtByIdAndUpdate = function (vId, tId) {
    VirtualTile.findByIdAndUpdate(vId, { tile: tId }, { new: true }, function (err, virtualTile) {
      if (err) return next(error);
      return res.json(virtualTile);
    });
  }

  if (tileId != null) {
    Tile.findById(tileId, function (err, tile) {
      if (err) return next(error);
      if (!tile) return res.json(null);
      findVtByIdAndUpdate(virtualTileId, tileId);
    });
  } else {
    findVtByIdAndUpdate(virtualTileId, null);
  }

});

// TODO: REMOVE if not needed????
router.post('/:app/aname/:name', function (req, res) { // Update (pair) physical Tile to Virtual Tiles by using virtual name
  var aName = req.params.name;
  var tileId = req.body.tile;
  VirtualTile.findOneAndUpdate({ application: req.application._id, virtualName: aName },
    { tile: tileId },
    { new: true },
    function (err, virtualTile) {
      if (err) return next(err);
      return res.json(virtualTile);
    });
});

module.exports = router;
