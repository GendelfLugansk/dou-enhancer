/* global chrome */
import debounce from './debounce';

/**
 * Profiler is needed to measure how much time certain functions take to execute
 *
 * @constructor
 */
const Profiler = function () {
  this.stats = [];
  this.statsInProgress = {};
  this.enabled = false;
  this.session = (new Date()).getTime();
  this.url = String(window.location)
};

let instance = null;

Profiler.getInstance = function () {
  if (instance === null) {
    instance = new Profiler();
  }

  return instance;
};

Profiler.prototype.enable = function () {
  this.enabled = true;
};

Profiler.prototype.disable = function () {
  this.enabled = false;
};

/**
 * @param {String} id Task id
 */
Profiler.prototype.start = function (id) {
  if (!this.enabled) {
    return;
  }

  id = String(id);
  const time = (new Date).getTime();
  if (this.statsInProgress[id] === undefined) {
    this.statsInProgress[id] = time;
  }
};

/**
 * @param {String} id Task id
 */
Profiler.prototype.stop = function (id) {
  if (!this.enabled) {
    return;
  }

  id = String(id);
  const time = (new Date).getTime();
  if (this.statsInProgress[id] !== undefined) {
    const stat = {
      id,
      time: time - this.statsInProgress[id],
      session: this.session,
      url: this.url,
    };
    this.stats.push(stat);
    this.log(`task ${id} worked ${stat.time} ms`);
    delete this.statsInProgress[id];
    this.store();
  }
};

Profiler.prototype.store = debounce(function () {
  chrome.storage.local.get('profilerStats', (stats) => {
    chrome.storage.local.set({'profilerStats': (stats.profilerStats || []).concat(this.stats)});
  });
}, 100);

Profiler.prototype.log = function (message) {
  /* eslint-disable no-console */
  console.log('Profiler: ' + message);
  /* eslint-enable no-console */
};

export default Profiler.getInstance();
