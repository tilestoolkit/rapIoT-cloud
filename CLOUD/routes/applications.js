var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Application = mongoose.model('Application');
var User = mongoose.model('User');
var VirtualTile = mongoose.model('VirtualTile');
var Tile = mongoose.model('Tile');
var exec = require('child_process').exec;

// Helper: Start hosting workspace
var startHostingWorkspace = function (workspace, port, applicationId, callback) {
  var uid = "wrk:" + applicationId;

  if (process.platform === "linux") {  // Only run on linux
    var usr = "admin";
    var pwd = "admin";
    exec("sudo -H -u c9sdk bash -c 'forever start --uid " + uid
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
var stopHostingWorkspace = function (applicationId) {
  var uid = "wrk:" + applicationId;

  if (process.platfomr === "linux") {
    exec("sudo -H -u c0sdk bash -c 'forever stop " + uid + "'");
  }
  else {
    callback("ERROR: Hosting only for linux");
  }
}
// Helper: Create workspace
var createWorkspace = function (workspace) {
  if (process.platform === "linux") {
    exec("sudo -H -u c9sdk bash -c 'mkdir /home/c9sdk/" + workspace + "'", callback);
    // TODO: Copy template to workspace as tiles.js and template-api.js from root
  }
  else {
    callback("ERROR: Workspace only for linux");
  }
}
// Helper: Remove workspace
var removeWorkspace = function (workspace) {
  if (process.platform === "linux") {
    exec("rm -r /home/c9sdk/" + workspace + "'", callback);
  }
  else {
    callback("ERROR: Workspace only for linux");
  }
}
// Helper: Start application
var startApplication = function (workspace, applicationId, callback) {
  var uid = "app:" + applicationId;

  if (process.platform === "linux") {
    exec("forever start --uid " + uid + " /home/c9sdk/" + workspace + "/tiles.js", callback);
  } else {
    callback("ERROR: Application hosting only on linux");
  }
}
// Helper: Stop application
var stopApplication = function (applicationId) {
  var uid = "app:" + applicationId;

  if (process.platform === "linux") {
    exec("forever stop uid", callback);
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

  application.save(function (err, user) {
    if (err) { return next(err); }
    res.json(application);
  });

  if (req.body.devEnvironment === "Cloud") {
    createWorkspace(req.body.name, function (error) {
      console.log(error);
    });
  }
});

router.param('app', function (req, res, next, id) {
  var query = Application.findById(id).populate('virtualTiles').populate('user');

  query.exec(function (err, app) {
    if (err) { return next(err); }
    if (!app) { return next(new Error('Can\'t find application.')); }

    req.application = app;
    console.log("app", app);
    return next();
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

  if (req.application.devEnvironment == 'Cloud') {
    if (req.application.environmentOnline) { // If workspace is being hosted, shut down first, then delete
      stopHostingWorkspace(req.application._id, function (error, stdout, stderr) {
        if (error) {
          console.log(error);
          return;
        }
        removeWorkspace(req.application.workspace, callback);
      });
    }
    else { // Workspace is not hosted, just delete workspace
      removeWorkspace(req.application.workspace, callback);
    }
  }
});

router.get('/:app/host/workspace', function (req, res, next) {
  var app = req.application;
  if (app.devEnvironment !== 'Cloud') {
    res.status(400).end;
    return;
  }

  if (!app.environmentOnline) {  // Start hosting workspace
    var port = 8282; //TODO: Find port!
    var callback = function (error) {
      if (error) {
        console.log(error);
        return;
      }
      return Application.findByIdAndUpdate(app.id, { environmentOnline: true, port: port }, { new: true }, function (err, application) {
        if (err) return next(error);
        return res.json(application);
      });
    }
    startHostingWorkspace(app.name, port, app._id, callback);

  } else {  // Stop hosting workspace
    var callback = function (error) {
      if (error) {
        console.log(error);
        return;
      }
      return Application.findByIdAndUpdate(app._id, { environmentOnline: false, port: 0 }, { new: true }, function (err, application) {
        if (err) return next(error);
        return res.json(application);
      });
    }
    stopHostingWorkspace(app._id, callback);
  }
});

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
})

// router.post('/:app/tiles', function (req, res) {
//   var tileDeviceId = req.body.deviceId;
//   req.application.addTile(tileDeviceId);
//   res.json(req.application.tiles);
// });

// router.get('/:app/tiles', function (req, res, next) {
//   res.json(req.application.tiles);
// });

// router.get('/:app/tiles/:id', function (req, res, next) {
//   for (var index in req.application.tiles)//loop through application Tiles, to see if any tiles are found matching current ID
//   {
//     if (req.application.tiles[index]['_id'] === req.params.id) {
//       res.json(req.application.tiles[index]);
//       return;
//     }
//   }
//   res.json({ "error": true, "message": "No tile found" });
// });

// router.delete('/:app/tiles/:id', function (req, res, next) {
//   Application.update({ _id: req.application._id }, { $pull: { 'tiles': req.params.id } }, function (error, data) {//remove tile from application
//     if (data.nModified)
//       res.json({ "success": true, "message": "Tile removed" });
//     else
//       res.json({ "error": true, "message": "Couldn't find Tile to remove" });
//   });
// });

// router.get('/:user/tiles/name/:name', function (req, res, next) {
//   for (var i = 0; i < req.user.tiles.length; i++) {
//     if (req.user.tiles[i]['name'] === req.params.name) {
//       res.json(req.user.tiles[i]);
//       return;
//     }
//   }
//   return next(err);
// });

module.exports = router;
