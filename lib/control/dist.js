'use strict';
const FS = require('fs');
const MIME = require('mime');
const Path = require('path');

exports.attach = function(app) {
  const prefix = Path.resolve(__dirname, '../../dist');

  app.use('/_dist', function(req, res, next) {
    const resource = Path.resolve('/', req.path); // Squash ../path/../traversals

    const type = MIME.lookup(resource);
    const path = Path.join(prefix, resource);

    FS.stat(path, function(err, stats) {
      if (err) {
        if (err.code == 'ENOENT') return res.status(404).end();
        return next(err);
      }

      if (stats.isDirectory()) return res.status(404).end();

      res.set('content-length', stats.size);
      res.set('content-type', type);

      FS.createReadStream(path).pipe(res);
    });
  });
};
