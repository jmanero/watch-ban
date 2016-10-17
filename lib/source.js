'use strict';
const Crypto = require('crypto');
const EventEmitter = require('events').EventEmitter;
const HTTP = require('http');
const HTTPS = require('https');
const URL = require('url');

/**
 * Manage the polling and rendering of a block-list
 */
class Source extends EventEmitter {
  /**
   * @constructor
   * @param {String}  name  Source name
   * @param {Object}  options
   * @param {String}  options.uri URI of remote resource
   * @param {String|Number} options.interval Polling interval
   */
  constructor(name, options) {
    super();
    options = Object.assign({
      interval: 'hourly'
    }, options);

    if (!options.uri) throw TypeError('Missing required parameter `uri`');

    this.name = name;
    this.uri = options.uri;
    this.interval = options.interval;

    this.provider = URL.parse(this.uri).protocol === 'https:' ? HTTPS : HTTP;

    this.signature = null;
    this.updated = null;
  }

  /**
   * Fetch entries from the remote source
   */
  fetch() {
    return new Promise((resolve, reject) => {
      this.provider.get(this.uri)
        .on('response', (res) => {
          const chunks = [];
          const hash = Crypto.createHash('md5');

          res.on('data', (chunk) => {
            hash.update(chunk);
            chunks.push(chunk);
          });

          res.on('end', (chunk) => {
            if (chunk) chunks.push(chunk);

            const signature = hash.digest('base64');
            if (this.signature === signature) {
              Log.info('Source: source data has not changed', {name: this.name, signature});
              return resolve(this);
            }

            const data = Buffer.concat(chunks).toString('utf8');
            const entries = data.trim().split(/\n/g);

            this.signature = signature;
            this.updated = new Date();
            this.entries = entries.map((entry) => entry.trim());

            // Build a search tree to match subdomains
            this._includes = this.entries
              .map((entry) => entry.split(/\./g).reverse())
              .reduce((index, entry) => {
                let tree = index;

                for (let i = 0; i < entry.length; i++) {
                  const node = entry[i];
                  const last = (i == entry.length - 1);

                  if (!tree.hasOwnProperty(node) || tree[node] === true) {
                    tree[entry[i]] = last ? true : {};
                  }

                  tree = tree[node];
                }

                return index;
              }, {});

            Log.info('Source: source data has changed', {name: this.name, signature, entries: entries.length});
            this.emit('update', this.entries);
            resolve(this);
          });
        })
        .on('error', (err) => reject(err));
    });
  }

  /**
   * Convert various interval notations into milliseconds
   */
  static interval(value) {
    switch (value) {
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'hourly':
      return 60 * 60 * 1000;
    default:
      return Number(value);
    }
  }

  /**
   * Check if this source includes an entry
   *
   * @param {String}  entry
   * @return  {Boolean}
   */
  include(domain) {
    const entry = domain.split(/\./g).reverse();
    let tree = this._includes;

    for (let i = 0; i < entry.length; i++) {
      // End of tree. Domain is a subdomain.
      if (tree === true) return true;

      const node = entry[i];
      if (!tree.hasOwnProperty(node)) return false; // Not found
      tree = tree[node];
    }

    // Exact match
    return true;
  }

  /**
   * Start polling the remote source for changes
   */
  start() {
    if (this._interval) return;

    this._interval = setInterval(() => {
      this.fetch()
        .catch((err) => Log.error('Source: error fetching updates', err, {name: this.name}));

      this.next = new Date(Date.now() + this.interval);
    }, Source.interval(this.interval));

    this.fetch()
      .catch((err) => Log.error('Source: error fetching updates', err, {name: this.name}));

    this.next = new Date(Date.now() + this.interval);
    return this;
  }

  /**
   * Stop polling for changes
   */
  stop() {
    clearInterval(this._interval);
    delete this._interval;

    return this();
  }

  /**
   * Generate a JSON serializable Object
   * @return {Object}
   */
  toJSON() {
    return ({
      name: this.name,
      updated: this.updated,
      signature: this.signature,
      uri: this.uri,
      entries: Object.keys(this.entries).length
    });
  }
}
module.exports = Source;
