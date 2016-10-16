'use strict';

const Winston = require('winston');

/**
 * Logging provider
 * @global
 */
global.Log = new Winston.Logger();
Log.add(Winston.transports.Console, Config.get('log'));
