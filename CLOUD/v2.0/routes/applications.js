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

// Helper: Start hosting workspace
var startHostingWorkspace = function (workspace, port, applicationId, callback) {
  var tag = "[ERROR Start hosting workspace] ";
  var uid = "wrk:" + applicationId;

  if (process.platform === "linux") {  // Only run on linux
    var usr = "admin";
    var pwd = "admin";
    exec("sudo -H -u c9sdk bash -c 'forever start --uid " + uid + " -a "
      + " /home/c9sdk/c9sdk/server.js -p " + port
      + " -w /home/c9sdk/" + workspace
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
var createWorkspace = function (workspace) {
  var tag = "[ERROR Creating workspace] ";
  if (process.platform === "linux") {
    exec("sudo -H -u c9sdk bash -c 'mkdir /home/c9sdk/" + workspace + "'", function (error) {
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
          regex: '{{appNameHolder}}',
          replacement: workspace,
          paths: ['/home/c9sdk/' + workspace],
          recursive: true,
          silent: true
        });
        replace({
          regex: '{{ipAddressHolder}}',
          replacement: ipAddress,
          paths: ['/home/c9sdk/' + workspace],
          recursive: true,
          silent: true
        });
      }
      exec("sudo -H -u c9sdk bash -c 'cp /tiles-lib/templates/* /home/c9sdk/" + workspace + "'", renameApp);
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
    exec("rm -r /home/c9sdk/" + workspace, function (error) {
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
    exec("forever start --uid " + uid + " -a /home/c9sdk/" + workspace + "/tiles.js", function (error) {
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
        return;
      }
      callback();
    });
  } else {
    console.log(tag + "Application hosting only on linux");
  }
}

router.get('/', function (req, res, next) { // Get all applications
  Application.find(function (err, apps) {
    if (err) { return next(err); }
    res.json(apps);
  });
});

router.post('/', function (req, res, next) { // Create a new application [will create workspace if c9sdk is configured on server]
  var application = new Application(req.body);

  if (req.body.devEnvironment === "Cloud") {
    createWorkspace(req.body._id); // Helper method
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
    return res.json(vt);
  });
});

router.delete('/:app/virtualTile/:id', function (req, res, next) { // Delete Virtual Tile from application
  var vtId = req.params.id;
  Ifttthook.remove({ virtualTile: vtId }, function (err) { if (err) return next(err); }) // Remove Ifttthook registered to this virtual tile
  Tilehook.remove({ virtualTile: vtId }, function (err) { if (err) return next(err); }) // Remove Tilehook registered to this virtual tile
  Tilehook.remove({ outputVirtualTile: vtId }, function (err) { if (err) return next(err); }) // Remove Tilehook where this virtial tile is output tile

  VirtualTile.findByIdAndRemove(vtId, function (err) { // Remove virtual tile
    if (err) return next(err);
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
  VirtualTile.findByIdAndUpdate(virtualTileId, { tile: tileId }, { new: true }, function (err, virtualTile) {
    if (err) return next(error);
    return res.json(virtualTile);
  })
});

module.exports = router;
