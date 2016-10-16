'use strict';
const EJS = require('ejs');
const EventEmitter = require('events').EventEmitter;
const FS = require('fs');
const Path = require('path');

/**
 * Render a file from sources' entries lists
 */
class Renderer extends EventEmitter {
  /**
   * @constructor
   * @param {String}  name  Renderer name
   * @param {Object}  options
   * @param {String}  options.format  The template used to render the resource
   * @param {String}  options.path    The filesystem path that the resource will be written to
   * @param {Object}  options.variables Additional parameters that will be passed to the template
   */
  constructor(name, options) {
    super();
    options = Object.assign({}, options);

    if (!options.format) throw TypeError('Missing required parameter `format`');
    if (!options.path) throw TypeError('Missing required parameter `path`');

    this.name = name;
    this.template = EJS.compile(
      FS.readFileSync(Path.resolve(__dirname, '../template', `${options.format}.ejs`))
        .toString('utf8')
    );
    this.format = options.format;
    this.path = Path.resolve(__dirname, '..', options.path);
    this.variables = Object.assign({}, options.variables);

    this.sources = {};
  }

  /**
   * Listen for update events from a source
   * @param {Source}  source  A Source instance to watch
   */
  subscribe(source) {
    this.sources[source.name] = source;
    source.on('update', () => this.render());
  }

  /**
   * Trigger service reloads after the resource is updated
   */
  notify(service) {
    this.on('update', () => service.reload());
  }

  /**
   * Concatenate entries from all sources
   * @return {Array}
   */
  get entries() {
    return Array.prototype.concat.apply([],
      Object.keys(this.sources).map((name) => this.sources[name].entries));
  }

  /**
   * Render the resource and write it to the filesystem
   */
  render() {
    this.updated = new Date();

    const content = this.template({
      entries: this.entries,
      sources: this.sources,
      updated: this.updated,
      variables: this.variables
    });

    FS.writeFile(this.path, content, (err) => {
      if (err) return Log.error('Renderer: error writing resource', err, {name: this.name, path: this.path});
      this.emit('update');
    });
  }

  /**
   * Generate a JSON serializable Object
   * @return {Object}
   */
  toJSON() {
    return ({
      name: this.name,
      updated: this.updated,
      format: this.format,
      path: this.path
    });
  }
}
module.exports = Renderer;
