'use strict';

exports.attach = function(app, sources) {
  app.all('*', function(req, res) {
    const matching = Object.keys(sources)
      .map((name) => sources[name])
      .filter((source) => source.include(req.hostname));

    res.render('block.ejs', {
      domain: req.hostname, sources: matching
    });
  });
};
