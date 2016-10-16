'use strict';

exports.attach = function(app, sources) {
  app.get('/_api/v1/sources', (req, res) => res.json(sources));
  app.get('/_api/v1/sources/:name', (req, res) => {
    if (!sources.hasOwnProperty(req.params.name)) return res.status(404).json({
      error: 'Resource not found'
    });

    if (req.accepts('html')) return res.render('source.ejs', {
      source: sources[req.params.name]
    });

    res.json(sources[req.params.name]);
  });

  app.post('/_api/v1/sources/:name/update', (req, res, next) => {
    if (!sources.hasOwnProperty(req.params.name)) return res.status(404).json({
      error: 'Resource not found'
    });

    sources[req.params.name].fetch()
      .then((source) => res.redirect(`/_api/v1/sources/${source.name}`))
      .catch(next);
  });
};
