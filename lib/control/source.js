'use strict';

exports.attach = function(app, sources) {
  app.get('/_api/v1/source', (req, res) => res.json(sources));

  app.get('/_api/v1/source/:name', (req, res) => {
    if (!sources.hasOwnProperty(req.params.name)) return res.status(404).json({
      error: 'Resource not found'
    });

    if (req.accepts('html')) return res.render('source.ejs', {
      source: sources[req.params.name]
    });

    res.json(sources[req.params.name]);
  });

  app.get('/_api/v1/source/:name/tree', (req, res) => {
    if (!sources.hasOwnProperty(req.params.name)) return res.status(404).json({
      error: 'Resource not found'
    });

    res.json(sources[req.params.name]._includes);
  });

  app.post('/_api/v1/source/:name/update', (req, res, next) => {
    if (!sources.hasOwnProperty(req.params.name)) return res.status(404).json({
      error: 'Resource not found'
    });

    sources[req.params.name].fetch()
      .then((source) => res.redirect(`/_api/v1/source/${source.name}`))
      .catch(next);
  });
};
