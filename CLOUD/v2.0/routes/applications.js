var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Application = mongoose.model('Application');
var User = mongoose.model('User');
var VirtualTile = mongoose.model('VirtualTile');
var Tile = mongoose.model('Tile');
var exec = require('child_process').exec;
var portfinder = require('portfinder');
var replace = require('replace');
var os = require('os');

// Helper: Start hosting workspace
var startHostingWorkspace = function (workspace, port, applicationId, callback) {
  var uid = "wrk:" + applicationId;

  if (process.platform === "linux") {  // Only run on linux
    var usr = "admin";
    var pwd = "admin";
    exec("sudo -H -u c9sdk bash -c 'forever start --uid " + uid + " -a "
      + " /home/c9sdk/c9sdk/server.js -p " + port
      + " -w /home/c9sdk/" + workspace
      + "/ -l 0.0.0.0 --auth " + usr + ":" + pwd + "'",
      callback);
    return port;
  } else {
    callback("ERROR: Hosting only for linux");
  }
}
// Helper: Stop hosting workspace
var stopHostingWorkspace = function (applicationId, callback) {
  var uid = "wrk:" + applicationId;

  if (process.platform === "linux") {
    exec("sudo -H -u c9sdk bash -c 'forever stop " + uid + "'", callback);
  }
  else {
    callback("ERROR: Hosting only for linux");
  }
}
// Helper: Create workspace
var createWorkspace = function (workspace, callback) {
  if (process.platform === "linux") {
    exec("sudo -H -u c9sdk bash -c 'mkdir /home/c9sdk/" + workspace + "'", function (error) {
      if (error) {
        callback(error);
        return;
      }
      var renameApp = function (error) {
        if (error) {
          callback(error);
          return;
        }
        var ipAddress = os.networkInterfaces().eth0[0].address
        if(!ipAddress) ipAddress = '138.68.144.206';
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
          paths: ['/home/c9sdk/'+workspace],
          recursive: true,
          silent: true
        })
        callback();
      }
      exec("sudo -H -u c9sdk bash -c 'cp /tiles-lib/templates/* /home/c9sdk/" + workspace + "'", renameApp);
    });
  }
  else {
    callback("ERROR: Workspace only for linux");
  }
}
// Helper: Remove workspace
var removeWorkspace = function (workspace, callback) {
  if (process.platform === "linux") {
    exec("rm -r /home/c9sdk/" + workspace, callback);
  }
  else {
    callback("ERROR: Workspace only for linux");
  }
}
// Helper: Start application
var startApplication = function (workspace, applicationId, callback) {
  var uid = "app:" + applicationId;

  if (process.platform === "linux") {
    exec("forever start --uid " + uid + " -a /home/c9sdk/" + workspace + "/tiles.js", callback);
  } else {
    callback("ERROR: Application hosting only on linux");
  }
}
// Helper: Stop application
var stopApplication = function (applicationId, callback) {
  var uid = "app:" + applicationId;

  if (process.platform === "linux") {
    exec("forever stop " + uid, callback);
  } else {
    callback("ERROR: Application hosting only on linux");
  }
}

router.get('/', function (req, res, next) {
  Application.find(function (err, apps) {
    if (err) { return next(err); }
    res.json(apps);
  });
});

router.post('/', function (req, res, next) {
  var application = new Application(req.body);

  if (req.body.devEnvironment === "Cloud") {
    createWorkspace(req.body._id, function (error) {
      if (error) console.log(error);
    });
  }

  application.save(function (err, user) {
    if (err) { return next(err); }
    res.json(application);
  });
});

router.param('app', function (req, res, next, id) {
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
      console.log("app", fullApp);
      return next();
    });
  });
});

router.get('/:app', function (req, res) {
  res.json(req.application);
});

router.delete('/:app', function (req, res, next) {
  VirtualTile.remove({ application: req.application._id }, function (err) {
    if (err) return next(err);
  }); // Virtual Tiles removed from mongoDB

  var callback = function (error, stdout, stderr) {
    if (error) {
      console.log(error);
      return;
    }
    return Application.findByIdAndRemove(req.application._id, function (err) {
      if (err) return next(err);
      res.status(204).end();
    }); // Application removed from mongoDB
  }

  var stopWorkspaceAndDelete = function (error) {
    if (req.application.devEnvironment == 'Cloud') {
      if (error) {
        console.log(error);
        return;
      }
      if (req.application.environmentOnline) { // If workspace is being hosted, shut down first, then delete
        stopHostingWorkspace(req.application._id, function (error, stdout, stderr) {
          if (error) {
            console.log(error);
            return;
          }
          removeWorkspace(req.application._id, callback);
        });
      }
      else { // Workspace is not hosted, just delete workspace
        removeWorkspace(req.application._id, callback);
      }
    }
  }

  if (req.application.appOnline) {  // If application is being hosted, shut down first, then delete
    stopApplication(req.application._id, stopWorkspaceAndDelete)
  } else {
    stopWorkspaceAndDelete();
  }
});

router.get('/:app/host/workspace', function (req, res, next) {
  var app = req.application;
  if (app.devEnvironment !== 'Cloud') {
    res.status(400).end;
    return;
  }

  if (!app.environmentOnline) {  // Start hosting workspace
    portfinder.getPort(function (err, port) {
      if (err) return next(err);

      var callback = function (error) {
        if (error) {
          console.log(error);
          return;
        }
        Application.findByIdAndUpdate(app.id, { environmentOnline: true, port: port }, { new: true }, function (err, application) {
          if (err) return next(error);
          res.json(application);
        });
      }
      startHostingWorkspace(app._id, port, app._id, callback);
    });

  } else {  // Stop hosting workspace
    var callback = function (error) {
      if (error) {
        console.log(error);
        return;
      }
      Application.findByIdAndUpdate(app._id, { environmentOnline: false, port: 0 }, { new: true }, function (err, application) {
        if (err) return next(error);
        res.json(application);
      });
    }
    stopHostingWorkspace(app._id, callback);
  }
});

router.get('/:app/host/app', function (req, res, next) {
  var app = req.application;
  if (app.devEnvironment !== 'Cloud') {
    res.status(400).end;
    return;
  }

  if (!app.appOnline) {  // Start hosting app
    var callback = function (error) {
      if (error) {
        console.log(error);
        return;
      }
      return Application.findByIdAndUpdate(app._id, { appOnline: true }, { new: true }, function (err, application) {
        if (err) return next(error);
        res.json(application);
      });
    }
    startApplication(app._id, app._id, callback);

  } else {  // Stop hosting app
    var callback = function (error) {
      if (error) {
        console.log(error);
        return;
      }
      return Application.findByIdAndUpdate(app._id, { appOnline: false }, { new: true }, function (err, application) {
        if (err) return next(error);
        res.json(application);
      });
    }
    stopApplication(app._id, callback);
  }
})

router.post('/:app/virtualTile', function (req, res) {
  var virtualName = req.body.virtualName;
  var vt = new VirtualTile({ virtualName: virtualName, application: req.application._id, tile: null });
  vt.save(function (err, vt) {
    if (err) { return next(err); }
    req.application.addVirtualTile(vt._id);
    return res.json(vt);
  });
});

router.delete('/:app/virtualTile/:id', function (req, res, next) {
  var vtId = req.params.id;
  VirtualTile.findByIdAndRemove(vtId, function (err) { //remove virtual tile
    if (err) return next(err);
  });
  Application.update({ _id: req.application._id }, { $pull: { 'virtualTiles': req.params.id } }, function (error, data) {//remove virtualTile from application
    if (data.nModified)
      res.json({ "success": true, "message": "Tile removed" });
    else
      res.json({ "error": true, "message": "Couldn't find Tile to remove" });
  });
});

router.post('/:app/:id', function (req, res) {
  var virtualTileId = req.params.id;
  var tileId = req.body.tile;
  VirtualTile.findByIdAndUpdate(virtualTileId, { tile: tileId }, { new: true }, function (err, virtualTile) {
    if (err) return next(error);
    return res.json(virtualTile);
  })
});


module.exports = router;
