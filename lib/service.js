'use strict';
const CP = require('child_process');
const EventEmitter = require('events').EventEmitter;

/**
 * Manage reconfiguration of a host-service
 */
class Service extends EventEmitter {
  /**
   * @constructor
   * @param {String}  name  The service name
   * @param {Object}  options
   * @param {String}  options.reload  Command to execute to reload the service
   */
  constructor(name, options) {
    super();
    options = Object.assign({}, options);

    if (!options.reload) throw TypeError('Missing required parameter `reload`');

    this.name = name;
    this.commands = {
      reload: options.reload
    };
  }

  /**
   * Schedule a reload of the managed service
   * @return {Promise}
   */
  reload() {
    return new Promise((resolve, reject) => {
      this.once('reloaded', () => resolve());

      if (this._reloading) return;

      Log.info('Service: scheduling reload', {name: this.name, command: this.commands.reload});
      this._reloading = setTimeout(() => {
        CP.exec(this.commands.reload, (err, stdout, stderr) => {
          delete this._reloading;

          if (err) {
            Log.error('Service: error reloading configuration', err, {name: this.name});
            return reject(err);
          }

          Log.info('Service: reloaded', {
            name: this.name, command: this.commands.reload, stdout, stderr});

          this.emit('reloaded');

          resolve();
        });
      }, 5000);
    });
  }

  /**
   * Generate a JSON serializable Object
   * @return {Object}
   */
  toJSON() {
    return ({
      name: this.name,
      commands: this.commands
    });
  }
}
module.exports = Service;
