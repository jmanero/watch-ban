'use strict';
const Path = require('path');

/**
 * Service Configuration
 * @global
 */
global.Config = require('nconf');

Config.argv({
  config: {
    alias: 'c'
  }
});

if (Config.get('config')) {
  Config.file(Path.resolve(__dirname, '..', Config.get('config')));
}

Config.defaults({
  listen: {
    port: 9132,
    bind: 'localhost'
  },
  sources: {},
  renderers: {},
  services: {}
});
