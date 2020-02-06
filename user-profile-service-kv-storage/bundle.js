(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
const { StorageArea } = require('kv-storage-polyfill');
const optimizelySdk = require('@optimizely/optimizely-sdk');
const storage = new StorageArea();

const userProfileService = {
    lookup: async (userId) => {
        const result = await storage.get(userId);
        console.log("Lookup", result);
        return result;
    },
    save: async (userProfileMap) => {
        const { user_id: userId, experiment_bucket_map: experimentBucketMap } = userProfileMap;
        await storage.set(userId, experimentBucketMap);
        console.log("Saved");
    },
};

const optimizelyClientInstance = optimizelySdk.createInstance({
    datafile: {
        "version": "4",
        "rollouts": [],
        "anonymizeIP": true,
        "projectId": "10431130345",
        "variables": [],
        "featureFlags": [],
        "experiments": [
            {
                "status": "Running",
                "key": "ab_running_exp_untargeted",
                "layerId": "10417730432",
                "trafficAllocation": [
                    {
                        "entityId": "10418551353",
                        "endOfRange": 10000
                    }
                ],
                "audienceIds": [],
                "variations": [
                    {
                        "variables": [],
                        "id": "10418551353",
                        "key": "all_traffic_variation"
                    },
                    {
                        "variables": [],
                        "id": "10418551354",
                        "key": "no_traffic_variation"
                    },
                    {
                        "variables": [],
                        "id": "10418551355",
                        "key": "no_traffic_variation_2"
                    },
                    {
                        "variables": [],
                        "id": "10418510624",
                        "key": "a"
                    }
                ],
                "forcedVariations": {},
                "id": "10420810910"
            },
        ],
        "audiences": [
        ],
        "groups": [],
        "attributes": [
            {
                "id": "10401066170",
                "key": "customattr"
            }
        ],
        "accountId": "10367498574",
        "events": [
        ],
        "revision": "241"
    },
    userProfileService,
});

const testStorage = async () => {

    const userId = '10431130345';

    const getMap = async () => {
        const map = await storage.get(userId);
        return map ? map : {};
    };

    const attributes = {
        $opt_experiment_bucket_map: getMap()
    };
    console.log('got variation', optimizelyClientInstance.activate('ab_running_exp_untargeted', userId, attributes));
    console.log('got variation', optimizelyClientInstance.activate('ab_running_exp_untargeted', userId, attributes));
    await storage.clear();
};

testStorage();

},{"@optimizely/optimizely-sdk":39,"kv-storage-polyfill":53}],4:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
function randomMilliseconds() {
    return Math.round(Math.random() * 1000);
}
var BackoffController = /** @class */ (function () {
    function BackoffController() {
        this.errorCount = 0;
    }
    BackoffController.prototype.getDelay = function () {
        if (this.errorCount === 0) {
            return 0;
        }
        var baseWaitSeconds = config_1.BACKOFF_BASE_WAIT_SECONDS_BY_ERROR_COUNT[Math.min(config_1.BACKOFF_BASE_WAIT_SECONDS_BY_ERROR_COUNT.length - 1, this.errorCount)];
        return baseWaitSeconds * 1000 + randomMilliseconds();
    };
    BackoffController.prototype.countError = function () {
        if (this.errorCount < config_1.BACKOFF_BASE_WAIT_SECONDS_BY_ERROR_COUNT.length - 1) {
            this.errorCount++;
        }
    };
    BackoffController.prototype.reset = function () {
        this.errorCount = 0;
    };
    return BackoffController;
}());
exports.default = BackoffController;

},{"./config":7}],5:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var browserRequest_1 = require("./browserRequest");
var httpPollingDatafileManager_1 = __importDefault(require("./httpPollingDatafileManager"));
var BrowserDatafileManager = /** @class */ (function (_super) {
    __extends(BrowserDatafileManager, _super);
    function BrowserDatafileManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BrowserDatafileManager.prototype.makeGetRequest = function (reqUrl, headers) {
        return browserRequest_1.makeGetRequest(reqUrl, headers);
    };
    BrowserDatafileManager.prototype.getConfigDefaults = function () {
        return {
            autoUpdate: false,
        };
    };
    return BrowserDatafileManager;
}(httpPollingDatafileManager_1.default));
exports.default = BrowserDatafileManager;

},{"./browserRequest":6,"./httpPollingDatafileManager":9}],6:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var js_sdk_logging_1 = require("@optimizely/js-sdk-logging");
var logger = js_sdk_logging_1.getLogger('DatafileManager');
var GET_METHOD = 'GET';
var READY_STATE_DONE = 4;
function parseHeadersFromXhr(req) {
    var allHeadersString = req.getAllResponseHeaders();
    if (allHeadersString === null) {
        return {};
    }
    var headerLines = allHeadersString.split('\r\n');
    var headers = {};
    headerLines.forEach(function (headerLine) {
        var separatorIndex = headerLine.indexOf(': ');
        if (separatorIndex > -1) {
            var headerName = headerLine.slice(0, separatorIndex);
            var headerValue = headerLine.slice(separatorIndex + 2);
            if (headerValue.length > 0) {
                headers[headerName] = headerValue;
            }
        }
    });
    return headers;
}
function setHeadersInXhr(headers, req) {
    Object.keys(headers).forEach(function (headerName) {
        var header = headers[headerName];
        req.setRequestHeader(headerName, header);
    });
}
function makeGetRequest(reqUrl, headers) {
    var req = new XMLHttpRequest();
    var responsePromise = new Promise(function (resolve, reject) {
        req.open(GET_METHOD, reqUrl, true);
        setHeadersInXhr(headers, req);
        req.onreadystatechange = function () {
            if (req.readyState === READY_STATE_DONE) {
                var statusCode = req.status;
                if (statusCode === 0) {
                    reject(new Error('Request error'));
                    return;
                }
                var headers_1 = parseHeadersFromXhr(req);
                var resp = {
                    statusCode: req.status,
                    body: req.responseText,
                    headers: headers_1,
                };
                resolve(resp);
            }
        };
        req.timeout = config_1.REQUEST_TIMEOUT_MS;
        req.ontimeout = function () {
            logger.error('Request timed out');
        };
        req.send();
    });
    return {
        responsePromise: responsePromise,
        abort: function () {
            req.abort();
        },
    };
}
exports.makeGetRequest = makeGetRequest;

},{"./config":7,"@optimizely/js-sdk-logging":22}],7:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
exports.MIN_UPDATE_INTERVAL = 1000;
exports.DEFAULT_URL_TEMPLATE = "https://cdn.optimizely.com/datafiles/%s.json";
exports.BACKOFF_BASE_WAIT_SECONDS_BY_ERROR_COUNT = [0, 8, 16, 32, 64, 128, 256, 512];
exports.REQUEST_TIMEOUT_MS = 60 * 1000; // 1 minute

},{}],8:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.listeners = {};
        this.listenerId = 1;
    }
    EventEmitter.prototype.on = function (eventName, listener) {
        var _this = this;
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = {};
        }
        var currentListenerId = String(this.listenerId);
        this.listenerId++;
        this.listeners[eventName][currentListenerId] = listener;
        return function () {
            if (_this.listeners[eventName]) {
                delete _this.listeners[eventName][currentListenerId];
            }
        };
    };
    EventEmitter.prototype.emit = function (eventName, arg) {
        var listeners = this.listeners[eventName];
        if (listeners) {
            Object.keys(listeners).forEach(function (listenerId) {
                var listener = listeners[listenerId];
                listener(arg);
            });
        }
    };
    EventEmitter.prototype.removeAllListeners = function () {
        this.listeners = {};
    };
    return EventEmitter;
}());
exports.default = EventEmitter;
// TODO: Create a typed event emitter for use in TS only (not JS)

},{}],9:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var js_sdk_logging_1 = require("@optimizely/js-sdk-logging");
var js_sdk_utils_1 = require("@optimizely/js-sdk-utils");
var eventEmitter_1 = __importDefault(require("./eventEmitter"));
var config_1 = require("./config");
var backoffController_1 = __importDefault(require("./backoffController"));
var logger = js_sdk_logging_1.getLogger('DatafileManager');
var UPDATE_EVT = 'update';
function isValidUpdateInterval(updateInterval) {
    return updateInterval >= config_1.MIN_UPDATE_INTERVAL;
}
function isSuccessStatusCode(statusCode) {
    return statusCode >= 200 && statusCode < 400;
}
var HttpPollingDatafileManager = /** @class */ (function () {
    function HttpPollingDatafileManager(config) {
        var _this = this;
        var configWithDefaultsApplied = __assign({}, this.getConfigDefaults(), config);
        var datafile = configWithDefaultsApplied.datafile, _a = configWithDefaultsApplied.autoUpdate, autoUpdate = _a === void 0 ? false : _a, sdkKey = configWithDefaultsApplied.sdkKey, _b = configWithDefaultsApplied.updateInterval, updateInterval = _b === void 0 ? config_1.DEFAULT_UPDATE_INTERVAL : _b, _c = configWithDefaultsApplied.urlTemplate, urlTemplate = _c === void 0 ? config_1.DEFAULT_URL_TEMPLATE : _c;
        this.isReadyPromiseSettled = false;
        this.readyPromiseResolver = function () { };
        this.readyPromiseRejecter = function () { };
        this.readyPromise = new Promise(function (resolve, reject) {
            _this.readyPromiseResolver = resolve;
            _this.readyPromiseRejecter = reject;
        });
        if (datafile) {
            this.currentDatafile = datafile;
            this.resolveReadyPromise();
        }
        else {
            this.currentDatafile = null;
        }
        this.isStarted = false;
        this.datafileUrl = js_sdk_utils_1.sprintf(urlTemplate, sdkKey);
        this.emitter = new eventEmitter_1.default();
        this.autoUpdate = autoUpdate;
        if (isValidUpdateInterval(updateInterval)) {
            this.updateInterval = updateInterval;
        }
        else {
            logger.warn('Invalid updateInterval %s, defaulting to %s', updateInterval, config_1.DEFAULT_UPDATE_INTERVAL);
            this.updateInterval = config_1.DEFAULT_UPDATE_INTERVAL;
        }
        this.currentTimeout = null;
        this.currentRequest = null;
        this.backoffController = new backoffController_1.default();
        this.syncOnCurrentRequestComplete = false;
    }
    HttpPollingDatafileManager.prototype.get = function () {
        return this.currentDatafile;
    };
    HttpPollingDatafileManager.prototype.start = function () {
        if (!this.isStarted) {
            logger.debug('Datafile manager started');
            this.isStarted = true;
            this.backoffController.reset();
            this.syncDatafile();
        }
    };
    HttpPollingDatafileManager.prototype.stop = function () {
        logger.debug('Datafile manager stopped');
        this.isStarted = false;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        this.emitter.removeAllListeners();
        if (this.currentRequest) {
            this.currentRequest.abort();
            this.currentRequest = null;
        }
        return Promise.resolve();
    };
    HttpPollingDatafileManager.prototype.onReady = function () {
        return this.readyPromise;
    };
    HttpPollingDatafileManager.prototype.on = function (eventName, listener) {
        return this.emitter.on(eventName, listener);
    };
    HttpPollingDatafileManager.prototype.onRequestRejected = function (err) {
        if (!this.isStarted) {
            return;
        }
        this.backoffController.countError();
        if (err instanceof Error) {
            logger.error('Error fetching datafile: %s', err.message, err);
        }
        else if (typeof err === 'string') {
            logger.error('Error fetching datafile: %s', err);
        }
        else {
            logger.error('Error fetching datafile');
        }
    };
    HttpPollingDatafileManager.prototype.onRequestResolved = function (response) {
        if (!this.isStarted) {
            return;
        }
        if (typeof response.statusCode !== 'undefined' &&
            isSuccessStatusCode(response.statusCode)) {
            this.backoffController.reset();
        }
        else {
            this.backoffController.countError();
        }
        this.trySavingLastModified(response.headers);
        var datafile = this.getNextDatafileFromResponse(response);
        if (datafile !== null) {
            logger.info('Updating datafile from response');
            this.currentDatafile = datafile;
            if (!this.isReadyPromiseSettled) {
                this.resolveReadyPromise();
            }
            else {
                var datafileUpdate = {
                    datafile: datafile,
                };
                this.emitter.emit(UPDATE_EVT, datafileUpdate);
            }
        }
    };
    HttpPollingDatafileManager.prototype.onRequestComplete = function () {
        if (!this.isStarted) {
            return;
        }
        this.currentRequest = null;
        if (!this.isReadyPromiseSettled && !this.autoUpdate) {
            // We will never resolve ready, so reject it
            this.rejectReadyPromise(new Error('Failed to become ready'));
        }
        if (this.autoUpdate && this.syncOnCurrentRequestComplete) {
            this.syncDatafile();
        }
        this.syncOnCurrentRequestComplete = false;
    };
    HttpPollingDatafileManager.prototype.syncDatafile = function () {
        var _this = this;
        var headers = {};
        if (this.lastResponseLastModified) {
            headers['if-modified-since'] = this.lastResponseLastModified;
        }
        logger.debug('Making datafile request to url %s with headers: %s', this.datafileUrl, function () { return JSON.stringify(headers); });
        this.currentRequest = this.makeGetRequest(this.datafileUrl, headers);
        var onRequestComplete = function () {
            _this.onRequestComplete();
        };
        var onRequestResolved = function (response) {
            _this.onRequestResolved(response);
        };
        var onRequestRejected = function (err) {
            _this.onRequestRejected(err);
        };
        this.currentRequest.responsePromise
            .then(onRequestResolved, onRequestRejected)
            .then(onRequestComplete, onRequestComplete);
        if (this.autoUpdate) {
            this.scheduleNextUpdate();
        }
    };
    HttpPollingDatafileManager.prototype.resolveReadyPromise = function () {
        this.readyPromiseResolver();
        this.isReadyPromiseSettled = true;
    };
    HttpPollingDatafileManager.prototype.rejectReadyPromise = function (err) {
        this.readyPromiseRejecter(err);
        this.isReadyPromiseSettled = true;
    };
    HttpPollingDatafileManager.prototype.scheduleNextUpdate = function () {
        var _this = this;
        var currentBackoffDelay = this.backoffController.getDelay();
        var nextUpdateDelay = Math.max(currentBackoffDelay, this.updateInterval);
        logger.debug('Scheduling sync in %s ms', nextUpdateDelay);
        this.currentTimeout = setTimeout(function () {
            if (_this.currentRequest) {
                _this.syncOnCurrentRequestComplete = true;
            }
            else {
                _this.syncDatafile();
            }
        }, nextUpdateDelay);
    };
    HttpPollingDatafileManager.prototype.getNextDatafileFromResponse = function (response) {
        logger.debug('Response status code: %s', response.statusCode);
        if (typeof response.statusCode === 'undefined') {
            return null;
        }
        if (response.statusCode === 304) {
            return null;
        }
        if (isSuccessStatusCode(response.statusCode)) {
            return this.tryParsingBodyAsJSON(response.body);
        }
        return null;
    };
    HttpPollingDatafileManager.prototype.tryParsingBodyAsJSON = function (body) {
        var parseResult;
        try {
            parseResult = JSON.parse(body);
        }
        catch (err) {
            logger.error('Error parsing response body: %s', err.message, err);
            return null;
        }
        var datafileObj = null;
        if (typeof parseResult === 'object' && parseResult !== null) {
            datafileObj = parseResult;
        }
        else {
            logger.error('Error parsing response body: was not an object');
        }
        return datafileObj;
    };
    HttpPollingDatafileManager.prototype.trySavingLastModified = function (headers) {
        var lastModifiedHeader = headers['last-modified'] || headers['Last-Modified'];
        if (typeof lastModifiedHeader !== 'undefined') {
            this.lastResponseLastModified = lastModifiedHeader;
            logger.debug('Saved last modified header value from response: %s', this.lastResponseLastModified);
        }
    };
    return HttpPollingDatafileManager;
}());
exports.default = HttpPollingDatafileManager;

},{"./backoffController":4,"./config":7,"./eventEmitter":8,"@optimizely/js-sdk-logging":22,"@optimizely/js-sdk-utils":12}],10:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var browserDatafileManager_1 = require("./browserDatafileManager");
exports.HttpPollingDatafileManager = browserDatafileManager_1.default;
var staticDatafileManager_1 = require("./staticDatafileManager");
exports.StaticDatafileManager = staticDatafileManager_1.default;

},{"./browserDatafileManager":5,"./staticDatafileManager":11}],11:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var doNothing = function () { };
var StaticDatafileManager = /** @class */ (function () {
    function StaticDatafileManager(datafile) {
        this.datafile = datafile;
        this.readyPromise = Promise.resolve();
    }
    StaticDatafileManager.prototype.get = function () {
        return this.datafile;
    };
    StaticDatafileManager.prototype.onReady = function () {
        return this.readyPromise;
    };
    StaticDatafileManager.prototype.start = function () {
    };
    StaticDatafileManager.prototype.stop = function () {
        return Promise.resolve();
    };
    StaticDatafileManager.prototype.on = function (eventName, listener) {
        return doNothing;
    };
    return StaticDatafileManager;
}());
exports.default = StaticDatafileManager;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var uuid_1 = require("uuid");
function getTimestamp() {
    return new Date().getTime();
}
exports.getTimestamp = getTimestamp;
function generateUUID() {
    return uuid_1.v4();
}
exports.generateUUID = generateUUID;
/**
 * Validates a value is a valid TypeScript enum
 *
 * @export
 * @param {object} enumToCheck
 * @param {*} value
 * @returns {boolean}
 */
function isValidEnum(enumToCheck, value) {
    var found = false;
    var keys = Object.keys(enumToCheck);
    for (var index = 0; index < keys.length; index++) {
        if (value === enumToCheck[keys[index]]) {
            found = true;
            break;
        }
    }
    return found;
}
exports.isValidEnum = isValidEnum;
function groupBy(arr, grouperFn) {
    var grouper = {};
    arr.forEach(function (item) {
        var key = grouperFn(item);
        grouper[key] = grouper[key] || [];
        grouper[key].push(item);
    });
    return objectValues(grouper);
}
exports.groupBy = groupBy;
function objectValues(obj) {
    return Object.keys(obj).map(function (key) { return obj[key]; });
}
exports.objectValues = objectValues;
function find(arr, cond) {
    var found;
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var item = arr_1[_i];
        if (cond(item)) {
            found = item;
            break;
        }
    }
    return found;
}
exports.find = find;
function keyBy(arr, keyByFn) {
    var map = {};
    arr.forEach(function (item) {
        var key = keyByFn(item);
        map[key] = item;
    });
    return map;
}
exports.keyBy = keyBy;
function sprintf(format) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var i = 0;
    return format.replace(/%s/g, function () {
        var arg = args[i++];
        var type = typeof arg;
        if (type === 'function') {
            return arg();
        }
        else if (type === 'string') {
            return arg;
        }
        else {
            return String(arg);
        }
    });
}
exports.sprintf = sprintf;

},{"uuid":234}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("./events");
var eventQueue_1 = require("./eventQueue");
var js_sdk_logging_1 = require("@optimizely/js-sdk-logging");
var js_sdk_utils_1 = require("@optimizely/js-sdk-utils");
var logger = js_sdk_logging_1.getLogger('EventProcessor');
var DEFAULT_FLUSH_INTERVAL = 30000; // Unit is ms - default flush interval is 30s
var DEFAULT_MAX_QUEUE_SIZE = 10;
var AbstractEventProcessor = /** @class */ (function () {
    function AbstractEventProcessor(_a) {
        var dispatcher = _a.dispatcher, _b = _a.flushInterval, flushInterval = _b === void 0 ? 30000 : _b, _c = _a.maxQueueSize, maxQueueSize = _c === void 0 ? 3000 : _c, notificationCenter = _a.notificationCenter;
        var _this = this;
        this.dispatcher = dispatcher;
        if (flushInterval <= 0) {
            logger.warn("Invalid flushInterval " + flushInterval + ", defaulting to " + DEFAULT_FLUSH_INTERVAL);
            flushInterval = DEFAULT_FLUSH_INTERVAL;
        }
        maxQueueSize = Math.floor(maxQueueSize);
        if (maxQueueSize < 1) {
            logger.warn("Invalid maxQueueSize " + maxQueueSize + ", defaulting to " + DEFAULT_MAX_QUEUE_SIZE);
            maxQueueSize = DEFAULT_MAX_QUEUE_SIZE;
        }
        maxQueueSize = Math.max(1, maxQueueSize);
        if (maxQueueSize > 1) {
            this.queue = new eventQueue_1.DefaultEventQueue({
                flushInterval: flushInterval,
                maxQueueSize: maxQueueSize,
                sink: function (buffer) { return _this.drainQueue(buffer); },
                batchComparator: events_1.areEventContextsEqual,
            });
        }
        else {
            this.queue = new eventQueue_1.SingleEventQueue({
                sink: function (buffer) { return _this.drainQueue(buffer); },
            });
        }
        this.notificationCenter = notificationCenter;
    }
    AbstractEventProcessor.prototype.drainQueue = function (buffer) {
        var _this = this;
        return new Promise(function (resolve) {
            logger.debug('draining queue with %s events', buffer.length);
            if (buffer.length === 0) {
                resolve();
                return;
            }
            var formattedEvent = _this.formatEvents(buffer);
            _this.dispatcher.dispatchEvent(formattedEvent, function () {
                resolve();
            });
            if (_this.notificationCenter) {
                _this.notificationCenter.sendNotifications(js_sdk_utils_1.NOTIFICATION_TYPES.LOG_EVENT, formattedEvent);
            }
        });
    };
    AbstractEventProcessor.prototype.process = function (event) {
        this.queue.enqueue(event);
    };
    AbstractEventProcessor.prototype.stop = function () {
        try {
            // swallow, an error stopping this queue should prevent this from stopping
            return this.queue.stop();
        }
        catch (e) {
            logger.error('Error stopping EventProcessor: "%s"', e.message, e);
        }
        return Promise.resolve();
    };
    AbstractEventProcessor.prototype.start = function () {
        this.queue.start();
    };
    return AbstractEventProcessor;
}());
exports.AbstractEventProcessor = AbstractEventProcessor;

},{"./eventQueue":14,"./events":15,"@optimizely/js-sdk-logging":22,"@optimizely/js-sdk-utils":26}],14:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var js_sdk_logging_1 = require("@optimizely/js-sdk-logging");
var logger = js_sdk_logging_1.getLogger('EventProcessor');
var Timer = /** @class */ (function () {
    function Timer(_a) {
        var timeout = _a.timeout, callback = _a.callback;
        this.timeout = Math.max(timeout, 0);
        this.callback = callback;
    }
    Timer.prototype.start = function () {
        this.timeoutId = setTimeout(this.callback, this.timeout);
    };
    Timer.prototype.refresh = function () {
        this.stop();
        this.start();
    };
    Timer.prototype.stop = function () {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    };
    return Timer;
}());
var SingleEventQueue = /** @class */ (function () {
    function SingleEventQueue(_a) {
        var sink = _a.sink;
        this.sink = sink;
    }
    SingleEventQueue.prototype.start = function () {
        // no-op
    };
    SingleEventQueue.prototype.stop = function () {
        // no-op
        return Promise.resolve();
    };
    SingleEventQueue.prototype.enqueue = function (event) {
        this.sink([event]);
    };
    return SingleEventQueue;
}());
exports.SingleEventQueue = SingleEventQueue;
var DefaultEventQueue = /** @class */ (function () {
    function DefaultEventQueue(_a) {
        var flushInterval = _a.flushInterval, maxQueueSize = _a.maxQueueSize, sink = _a.sink, batchComparator = _a.batchComparator;
        this.buffer = [];
        this.maxQueueSize = Math.max(maxQueueSize, 1);
        this.sink = sink;
        this.batchComparator = batchComparator;
        this.timer = new Timer({
            callback: this.flush.bind(this),
            timeout: flushInterval,
        });
        this.started = false;
    }
    DefaultEventQueue.prototype.start = function () {
        this.started = true;
        // dont start the timer until the first event is enqueued
    };
    DefaultEventQueue.prototype.stop = function () {
        this.started = false;
        var result = this.sink(this.buffer);
        this.buffer = [];
        this.timer.stop();
        return result;
    };
    DefaultEventQueue.prototype.enqueue = function (event) {
        if (!this.started) {
            logger.warn('Queue is stopped, not accepting event');
            return;
        }
        // If new event cannot be included into the current batch, flush so it can
        // be in its own new batch.
        var bufferedEvent = this.buffer[0];
        if (bufferedEvent && !this.batchComparator(bufferedEvent, event)) {
            this.flush();
        }
        // start the timer when the first event is put in
        if (this.buffer.length === 0) {
            this.timer.refresh();
        }
        this.buffer.push(event);
        if (this.buffer.length >= this.maxQueueSize) {
            this.flush();
        }
    };
    DefaultEventQueue.prototype.flush = function () {
        this.sink(this.buffer);
        this.buffer = [];
        this.timer.stop();
    };
    return DefaultEventQueue;
}());
exports.DefaultEventQueue = DefaultEventQueue;

},{"@optimizely/js-sdk-logging":22}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function areEventContextsEqual(eventA, eventB) {
    var contextA = eventA.context;
    var contextB = eventB.context;
    return (contextA.accountId === contextB.accountId &&
        contextA.projectId === contextB.projectId &&
        contextA.clientName === contextB.clientName &&
        contextA.clientVersion === contextB.clientVersion &&
        contextA.revision === contextB.revision &&
        contextA.anonymizeIP === contextB.anonymizeIP &&
        contextA.botFiltering === contextB.botFiltering);
}
exports.areEventContextsEqual = areEventContextsEqual;

},{}],16:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__export(require("./events"));
__export(require("./eventProcessor"));
__export(require("./pendingEventsDispatcher"));
__export(require("./v1/buildEventV1"));
__export(require("./v1/v1EventProcessor"));

},{"./eventProcessor":13,"./events":15,"./pendingEventsDispatcher":17,"./v1/buildEventV1":19,"./v1/v1EventProcessor":20}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var js_sdk_logging_1 = require("@optimizely/js-sdk-logging");
var pendingEventsStore_1 = require("./pendingEventsStore");
var js_sdk_utils_1 = require("@optimizely/js-sdk-utils");
var logger = js_sdk_logging_1.getLogger('EventProcessor');
var PendingEventsDispatcher = /** @class */ (function () {
    function PendingEventsDispatcher(_a) {
        var eventDispatcher = _a.eventDispatcher, store = _a.store;
        this.dispatcher = eventDispatcher;
        this.store = store;
    }
    PendingEventsDispatcher.prototype.dispatchEvent = function (request, callback) {
        this.send({
            uuid: js_sdk_utils_1.generateUUID(),
            timestamp: js_sdk_utils_1.getTimestamp(),
            request: request,
        }, callback);
    };
    PendingEventsDispatcher.prototype.sendPendingEvents = function () {
        var _this = this;
        var pendingEvents = this.store.values();
        logger.debug('Sending %s pending events from previous page', pendingEvents.length);
        pendingEvents.forEach(function (item) {
            try {
                _this.send(item, function () { });
            }
            catch (e) { }
        });
    };
    PendingEventsDispatcher.prototype.send = function (entry, callback) {
        var _this = this;
        this.store.set(entry.uuid, entry);
        this.dispatcher.dispatchEvent(entry.request, function (response) {
            _this.store.remove(entry.uuid);
            callback(response);
        });
    };
    return PendingEventsDispatcher;
}());
exports.PendingEventsDispatcher = PendingEventsDispatcher;
var LocalStoragePendingEventsDispatcher = /** @class */ (function (_super) {
    __extends(LocalStoragePendingEventsDispatcher, _super);
    function LocalStoragePendingEventsDispatcher(_a) {
        var eventDispatcher = _a.eventDispatcher;
        return _super.call(this, {
            eventDispatcher: eventDispatcher,
            store: new pendingEventsStore_1.LocalStorageStore({
                // TODO make this configurable
                maxValues: 100,
                key: 'fs_optly_pending_events',
            }),
        }) || this;
    }
    return LocalStoragePendingEventsDispatcher;
}(PendingEventsDispatcher));
exports.LocalStoragePendingEventsDispatcher = LocalStoragePendingEventsDispatcher;

},{"./pendingEventsStore":18,"@optimizely/js-sdk-logging":22,"@optimizely/js-sdk-utils":26}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var js_sdk_utils_1 = require("@optimizely/js-sdk-utils");
var js_sdk_logging_1 = require("@optimizely/js-sdk-logging");
var logger = js_sdk_logging_1.getLogger('EventProcessor');
var LocalStorageStore = /** @class */ (function () {
    function LocalStorageStore(_a) {
        var key = _a.key, _b = _a.maxValues, maxValues = _b === void 0 ? 1000 : _b;
        this.LS_KEY = key;
        this.maxValues = maxValues;
    }
    LocalStorageStore.prototype.get = function (key) {
        return this.getMap()[key] || null;
    };
    LocalStorageStore.prototype.set = function (key, value) {
        var map = this.getMap();
        map[key] = value;
        this.replace(map);
    };
    LocalStorageStore.prototype.remove = function (key) {
        var map = this.getMap();
        delete map[key];
        this.replace(map);
    };
    LocalStorageStore.prototype.values = function () {
        return js_sdk_utils_1.objectValues(this.getMap());
    };
    LocalStorageStore.prototype.clear = function () {
        this.replace({});
    };
    LocalStorageStore.prototype.replace = function (map) {
        try {
            // This is a temporary fix to support React Native which does not have localStorage.
            window.localStorage && localStorage.setItem(this.LS_KEY, JSON.stringify(map));
            this.clean();
        }
        catch (e) {
            logger.error(e);
        }
    };
    LocalStorageStore.prototype.clean = function () {
        var map = this.getMap();
        var keys = Object.keys(map);
        var toRemove = keys.length - this.maxValues;
        if (toRemove < 1) {
            return;
        }
        var entries = keys.map(function (key) { return ({
            key: key,
            value: map[key]
        }); });
        entries.sort(function (a, b) { return a.value.timestamp - b.value.timestamp; });
        for (var i = 0; i < toRemove; i++) {
            delete map[entries[i].key];
        }
        this.replace(map);
    };
    LocalStorageStore.prototype.getMap = function () {
        try {
            // This is a temporary fix to support React Native which does not have localStorage.
            var data = window.localStorage && localStorage.getItem(this.LS_KEY);
            if (data) {
                return JSON.parse(data) || {};
            }
        }
        catch (e) {
            logger.error(e);
        }
        return {};
    };
    return LocalStorageStore;
}());
exports.LocalStorageStore = LocalStorageStore;

},{"@optimizely/js-sdk-logging":22,"@optimizely/js-sdk-utils":26}],19:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ACTIVATE_EVENT_KEY = 'campaign_activated';
var CUSTOM_ATTRIBUTE_FEATURE_TYPE = 'custom';
var BOT_FILTERING_KEY = '$opt_bot_filtering';
/**
 * Given an array of batchable Decision or ConversionEvent events it returns
 * a single EventV1 with proper batching
 *
 * @param {ProcessableEvents[]} events
 * @returns {EventV1}
 */
function makeBatchedEventV1(events) {
    var visitors = [];
    var data = events[0];
    events.forEach(function (event) {
        if (event.type === 'conversion' || event.type === 'impression') {
            var visitor = makeVisitor(event);
            if (event.type === 'impression') {
                visitor.snapshots.push(makeDecisionSnapshot(event));
            }
            else if (event.type === 'conversion') {
                visitor.snapshots.push(makeConversionSnapshot(event));
            }
            visitors.push(visitor);
        }
    });
    return {
        client_name: data.context.clientName,
        client_version: data.context.clientVersion,
        account_id: data.context.accountId,
        project_id: data.context.projectId,
        revision: data.context.revision,
        anonymize_ip: data.context.anonymizeIP,
        enrich_decisions: true,
        visitors: visitors,
    };
}
exports.makeBatchedEventV1 = makeBatchedEventV1;
function makeConversionSnapshot(conversion) {
    var tags = __assign({}, conversion.tags);
    delete tags['revenue'];
    delete tags['value'];
    var event = {
        entity_id: conversion.event.id,
        key: conversion.event.key,
        timestamp: conversion.timestamp,
        uuid: conversion.uuid,
    };
    if (conversion.tags) {
        event.tags = conversion.tags;
    }
    if (conversion.value != null) {
        event.value = conversion.value;
    }
    if (conversion.revenue != null) {
        event.revenue = conversion.revenue;
    }
    return {
        events: [event],
    };
}
function makeDecisionSnapshot(event) {
    var layer = event.layer, experiment = event.experiment, variation = event.variation;
    var layerId = layer ? layer.id : null;
    var experimentId = experiment ? experiment.id : null;
    var variationId = variation ? variation.id : null;
    return {
        decisions: [
            {
                campaign_id: layerId,
                experiment_id: experimentId,
                variation_id: variationId,
            },
        ],
        events: [
            {
                entity_id: layerId,
                timestamp: event.timestamp,
                key: ACTIVATE_EVENT_KEY,
                uuid: event.uuid,
            },
        ],
    };
}
function makeVisitor(data) {
    var visitor = {
        snapshots: [],
        visitor_id: data.user.id,
        attributes: [],
    };
    data.user.attributes.forEach(function (attr) {
        visitor.attributes.push({
            entity_id: attr.entityId,
            key: attr.key,
            type: 'custom',
            value: attr.value,
        });
    });
    if (typeof data.context.botFiltering === 'boolean') {
        visitor.attributes.push({
            entity_id: BOT_FILTERING_KEY,
            key: BOT_FILTERING_KEY,
            type: CUSTOM_ATTRIBUTE_FEATURE_TYPE,
            value: data.context.botFiltering,
        });
    }
    return visitor;
}
/**
 * Event for usage with v1 logtier
 *
 * @export
 * @interface EventBuilderV1
 */
function buildImpressionEventV1(data) {
    var visitor = makeVisitor(data);
    visitor.snapshots.push(makeDecisionSnapshot(data));
    return {
        client_name: data.context.clientName,
        client_version: data.context.clientVersion,
        account_id: data.context.accountId,
        project_id: data.context.projectId,
        revision: data.context.revision,
        anonymize_ip: data.context.anonymizeIP,
        enrich_decisions: true,
        visitors: [visitor],
    };
}
exports.buildImpressionEventV1 = buildImpressionEventV1;
function buildConversionEventV1(data) {
    var visitor = makeVisitor(data);
    visitor.snapshots.push(makeConversionSnapshot(data));
    return {
        client_name: data.context.clientName,
        client_version: data.context.clientVersion,
        account_id: data.context.accountId,
        project_id: data.context.projectId,
        revision: data.context.revision,
        anonymize_ip: data.context.anonymizeIP,
        enrich_decisions: true,
        visitors: [visitor],
    };
}
exports.buildConversionEventV1 = buildConversionEventV1;

},{}],20:[function(require,module,exports){
"use strict";
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var eventProcessor_1 = require("../eventProcessor");
var buildEventV1_1 = require("./buildEventV1");
var LogTierV1EventProcessor = /** @class */ (function (_super) {
    __extends(LogTierV1EventProcessor, _super);
    function LogTierV1EventProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LogTierV1EventProcessor.prototype.formatEvents = function (events) {
        return {
            url: 'https://logx.optimizely.com/v1/events',
            httpVerb: 'POST',
            params: buildEventV1_1.makeBatchedEventV1(events),
        };
    };
    return LogTierV1EventProcessor;
}(eventProcessor_1.AbstractEventProcessor));
exports.LogTierV1EventProcessor = LogTierV1EventProcessor;

},{"../eventProcessor":13,"./buildEventV1":19}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @export
 * @class NoopErrorHandler
 * @implements {ErrorHandler}
 */
var NoopErrorHandler = /** @class */ (function () {
    function NoopErrorHandler() {
    }
    /**
     * @param {Error} exception
     * @memberof NoopErrorHandler
     */
    NoopErrorHandler.prototype.handleError = function (exception) {
        // no-op
        return;
    };
    return NoopErrorHandler;
}());
exports.NoopErrorHandler = NoopErrorHandler;
var globalErrorHandler = new NoopErrorHandler();
/**
 * @export
 * @param {ErrorHandler} handler
 */
function setErrorHandler(handler) {
    globalErrorHandler = handler;
}
exports.setErrorHandler = setErrorHandler;
/**
 * @export
 * @returns {ErrorHandler}
 */
function getErrorHandler() {
    return globalErrorHandler;
}
exports.getErrorHandler = getErrorHandler;
/**
 * @export
 */
function resetErrorHandler() {
    globalErrorHandler = new NoopErrorHandler();
}
exports.resetErrorHandler = resetErrorHandler;

},{}],22:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
__export(require("./errorHandler"));
__export(require("./models"));
__export(require("./logger"));

},{"./errorHandler":21,"./logger":23,"./models":24}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var errorHandler_1 = require("./errorHandler");
var js_sdk_utils_1 = require("@optimizely/js-sdk-utils");
var models_1 = require("./models");
var stringToLogLevel = {
    NOTSET: 0,
    DEBUG: 1,
    INFO: 2,
    WARNING: 3,
    ERROR: 4,
};
function coerceLogLevel(level) {
    if (typeof level !== 'string') {
        return level;
    }
    level = level.toUpperCase();
    if (level === 'WARN') {
        level = 'WARNING';
    }
    if (!stringToLogLevel[level]) {
        return level;
    }
    return stringToLogLevel[level];
}
var DefaultLogManager = /** @class */ (function () {
    function DefaultLogManager() {
        this.defaultLoggerFacade = new OptimizelyLogger();
        this.loggers = {};
    }
    DefaultLogManager.prototype.getLogger = function (name) {
        if (!name) {
            return this.defaultLoggerFacade;
        }
        if (!this.loggers[name]) {
            this.loggers[name] = new OptimizelyLogger({ messagePrefix: name });
        }
        return this.loggers[name];
    };
    return DefaultLogManager;
}());
var ConsoleLogHandler = /** @class */ (function () {
    /**
     * Creates an instance of ConsoleLogger.
     * @param {ConsoleLogHandlerConfig} config
     * @memberof ConsoleLogger
     */
    function ConsoleLogHandler(config) {
        if (config === void 0) { config = {}; }
        this.logLevel = models_1.LogLevel.NOTSET;
        if (config.logLevel !== undefined && js_sdk_utils_1.isValidEnum(models_1.LogLevel, config.logLevel)) {
            this.setLogLevel(config.logLevel);
        }
        this.logToConsole = config.logToConsole !== undefined ? !!config.logToConsole : true;
        this.prefix = config.prefix !== undefined ? config.prefix : '[OPTIMIZELY]';
    }
    /**
     * @param {LogLevel} level
     * @param {string} message
     * @memberof ConsoleLogger
     */
    ConsoleLogHandler.prototype.log = function (level, message) {
        if (!this.shouldLog(level) || !this.logToConsole) {
            return;
        }
        var logMessage = this.prefix + " - " + this.getLogLevelName(level) + " " + this.getTime() + " " + message;
        this.consoleLog(level, [logMessage]);
    };
    /**
     * @param {LogLevel} level
     * @memberof ConsoleLogger
     */
    ConsoleLogHandler.prototype.setLogLevel = function (level) {
        level = coerceLogLevel(level);
        if (!js_sdk_utils_1.isValidEnum(models_1.LogLevel, level) || level === undefined) {
            this.logLevel = models_1.LogLevel.ERROR;
        }
        else {
            this.logLevel = level;
        }
    };
    /**
     * @returns {string}
     * @memberof ConsoleLogger
     */
    ConsoleLogHandler.prototype.getTime = function () {
        return new Date().toISOString();
    };
    /**
     * @private
     * @param {LogLevel} targetLogLevel
     * @returns {boolean}
     * @memberof ConsoleLogger
     */
    ConsoleLogHandler.prototype.shouldLog = function (targetLogLevel) {
        return targetLogLevel >= this.logLevel;
    };
    /**
     * @private
     * @param {LogLevel} logLevel
     * @returns {string}
     * @memberof ConsoleLogger
     */
    ConsoleLogHandler.prototype.getLogLevelName = function (logLevel) {
        switch (logLevel) {
            case models_1.LogLevel.DEBUG:
                return 'DEBUG';
            case models_1.LogLevel.INFO:
                return 'INFO ';
            case models_1.LogLevel.WARNING:
                return 'WARN ';
            case models_1.LogLevel.ERROR:
                return 'ERROR';
            default:
                return 'NOTSET';
        }
    };
    /**
     * @private
     * @param {LogLevel} logLevel
     * @param {string[]} logArguments
     * @memberof ConsoleLogger
     */
    ConsoleLogHandler.prototype.consoleLog = function (logLevel, logArguments) {
        switch (logLevel) {
            case models_1.LogLevel.DEBUG:
                console.log.apply(console, logArguments);
                break;
            case models_1.LogLevel.INFO:
                console.info.apply(console, logArguments);
                break;
            case models_1.LogLevel.WARNING:
                console.warn.apply(console, logArguments);
                break;
            case models_1.LogLevel.ERROR:
                console.error.apply(console, logArguments);
                break;
            default:
                console.log.apply(console, logArguments);
        }
    };
    return ConsoleLogHandler;
}());
exports.ConsoleLogHandler = ConsoleLogHandler;
var globalLogLevel = models_1.LogLevel.NOTSET;
var globalLogHandler = null;
var OptimizelyLogger = /** @class */ (function () {
    function OptimizelyLogger(opts) {
        if (opts === void 0) { opts = {}; }
        this.messagePrefix = '';
        if (opts.messagePrefix) {
            this.messagePrefix = opts.messagePrefix;
        }
    }
    /**
     * @param {(LogLevel | LogInputObject)} levelOrObj
     * @param {string} [message]
     * @memberof OptimizelyLogger
     */
    OptimizelyLogger.prototype.log = function (level, message) {
        this.internalLog(coerceLogLevel(level), {
            message: message,
            splat: [],
        });
    };
    OptimizelyLogger.prototype.info = function (message) {
        var splat = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            splat[_i - 1] = arguments[_i];
        }
        this.namedLog(models_1.LogLevel.INFO, message, splat);
    };
    OptimizelyLogger.prototype.debug = function (message) {
        var splat = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            splat[_i - 1] = arguments[_i];
        }
        this.namedLog(models_1.LogLevel.DEBUG, message, splat);
    };
    OptimizelyLogger.prototype.warn = function (message) {
        var splat = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            splat[_i - 1] = arguments[_i];
        }
        this.namedLog(models_1.LogLevel.WARNING, message, splat);
    };
    OptimizelyLogger.prototype.error = function (message) {
        var splat = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            splat[_i - 1] = arguments[_i];
        }
        this.namedLog(models_1.LogLevel.ERROR, message, splat);
    };
    OptimizelyLogger.prototype.format = function (data) {
        return "" + (this.messagePrefix ? this.messagePrefix + ': ' : '') + js_sdk_utils_1.sprintf.apply(void 0, [data.message].concat(data.splat));
    };
    OptimizelyLogger.prototype.internalLog = function (level, data) {
        if (!globalLogHandler) {
            return;
        }
        if (level < globalLogLevel) {
            return;
        }
        globalLogHandler.log(level, this.format(data));
        if (data.error && data.error instanceof Error) {
            errorHandler_1.getErrorHandler().handleError(data.error);
        }
    };
    OptimizelyLogger.prototype.namedLog = function (level, message, splat) {
        var error;
        if (message instanceof Error) {
            error = message;
            message = error.message;
            this.internalLog(level, {
                error: error,
                message: message,
                splat: splat,
            });
            return;
        }
        if (splat.length === 0) {
            this.internalLog(level, {
                message: message,
                splat: splat,
            });
            return;
        }
        var last = splat[splat.length - 1];
        if (last instanceof Error) {
            error = last;
            splat.splice(-1);
        }
        this.internalLog(level, { message: message, error: error, splat: splat });
    };
    return OptimizelyLogger;
}());
var globalLogManager = new DefaultLogManager();
function getLogger(name) {
    return globalLogManager.getLogger(name);
}
exports.getLogger = getLogger;
function setLogHandler(logger) {
    globalLogHandler = logger;
}
exports.setLogHandler = setLogHandler;
function setLogLevel(level) {
    level = coerceLogLevel(level);
    if (!js_sdk_utils_1.isValidEnum(models_1.LogLevel, level) || level === undefined) {
        globalLogLevel = models_1.LogLevel.ERROR;
    }
    else {
        globalLogLevel = level;
    }
}
exports.setLogLevel = setLogLevel;
function getLogLevel() {
    return globalLogLevel;
}
exports.getLogLevel = getLogLevel;
/**
 * Resets all global logger state to it's original
 */
function resetLogger() {
    globalLogManager = new DefaultLogManager();
    globalLogLevel = models_1.LogLevel.NOTSET;
}
exports.resetLogger = resetLogger;

},{"./errorHandler":21,"./models":24,"@optimizely/js-sdk-utils":25}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["NOTSET"] = 0] = "NOTSET";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARNING"] = 3] = "WARNING";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

},{}],25:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12,"uuid":234}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var uuid_1 = require("uuid");
function getTimestamp() {
    return new Date().getTime();
}
exports.getTimestamp = getTimestamp;
function generateUUID() {
    return uuid_1.v4();
}
exports.generateUUID = generateUUID;
/**
 * Validates a value is a valid TypeScript enum
 *
 * @export
 * @param {object} enumToCheck
 * @param {*} value
 * @returns {boolean}
 */
function isValidEnum(enumToCheck, value) {
    var found = false;
    var keys = Object.keys(enumToCheck);
    for (var index = 0; index < keys.length; index++) {
        if (value === enumToCheck[keys[index]]) {
            found = true;
            break;
        }
    }
    return found;
}
exports.isValidEnum = isValidEnum;
function groupBy(arr, grouperFn) {
    var grouper = {};
    arr.forEach(function (item) {
        var key = grouperFn(item);
        grouper[key] = grouper[key] || [];
        grouper[key].push(item);
    });
    return objectValues(grouper);
}
exports.groupBy = groupBy;
function objectValues(obj) {
    return Object.keys(obj).map(function (key) { return obj[key]; });
}
exports.objectValues = objectValues;
function objectEntries(obj) {
    return Object.keys(obj).map(function (key) { return [key, obj[key]]; });
}
exports.objectEntries = objectEntries;
function find(arr, cond) {
    var found;
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var item = arr_1[_i];
        if (cond(item)) {
            found = item;
            break;
        }
    }
    return found;
}
exports.find = find;
function keyBy(arr, keyByFn) {
    var map = {};
    arr.forEach(function (item) {
        var key = keyByFn(item);
        map[key] = item;
    });
    return map;
}
exports.keyBy = keyBy;
function sprintf(format) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var i = 0;
    return format.replace(/%s/g, function () {
        var arg = args[i++];
        var type = typeof arg;
        if (type === 'function') {
            return arg();
        }
        else if (type === 'string') {
            return arg;
        }
        else {
            return String(arg);
        }
    });
}
exports.sprintf = sprintf;
/*
 * Notification types for use with NotificationCenter
 * Format is EVENT: <list of parameters to callback>
 *
 * SDK consumers can use these to register callbacks with the notification center.
 *
 *  @deprecated since 3.1.0
 *  ACTIVATE: An impression event will be sent to Optimizely
 *  Callbacks will receive an object argument with the following properties:
 *    - experiment {Object}
 *    - userId {string}
 *    - attributes {Object|undefined}
 *    - variation {Object}
 *    - logEvent {Object}
 *
 *  DECISION: A decision is made in the system. i.e. user activation,
 *  feature access or feature-variable value retrieval
 *  Callbacks will receive an object argument with the following properties:
 *    - type {string}
 *    - userId {string}
 *    - attributes {Object|undefined}
 *    - decisionInfo {Object|undefined}
 *
 *  LOG_EVENT: A batch of events, which could contain impressions and/or conversions,
 *  will be sent to Optimizely
 *  Callbacks will receive an object argument with the following properties:
 *    - url {string}
 *    - httpVerb {string}
 *    - params {Object}
 *
 *  OPTIMIZELY_CONFIG_UPDATE: This Optimizely instance has been updated with a new
 *  config
 *
 *  TRACK: A conversion event will be sent to Optimizely
 *  Callbacks will receive the an object argument with the following properties:
 *    - eventKey {string}
 *    - userId {string}
 *    - attributes {Object|undefined}
 *    - eventTags {Object|undefined}
 *    - logEvent {Object}
 *
 */
var NOTIFICATION_TYPES;
(function (NOTIFICATION_TYPES) {
    NOTIFICATION_TYPES["ACTIVATE"] = "ACTIVATE:experiment, user_id,attributes, variation, event";
    NOTIFICATION_TYPES["DECISION"] = "DECISION:type, userId, attributes, decisionInfo";
    NOTIFICATION_TYPES["LOG_EVENT"] = "LOG_EVENT:logEvent";
    NOTIFICATION_TYPES["OPTIMIZELY_CONFIG_UPDATE"] = "OPTIMIZELY_CONFIG_UPDATE";
    NOTIFICATION_TYPES["TRACK"] = "TRACK:event_key, user_id, attributes, event_tags, event";
})(NOTIFICATION_TYPES = exports.NOTIFICATION_TYPES || (exports.NOTIFICATION_TYPES = {}));

},{"uuid":234}],27:[function(require,module,exports){
/**
 * Copyright 2016, 2018-2019 Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var conditionTreeEvaluator = require('../condition_tree_evaluator');
var customAttributeConditionEvaluator = require('../custom_attribute_condition_evaluator');
var enums = require('../../utils/enums');
var fns = require('../../utils/fns');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;
var logging = require('@optimizely/js-sdk-logging');
var logger = logging.getLogger();

var ERROR_MESSAGES = enums.ERROR_MESSAGES;
var LOG_LEVEL = enums.LOG_LEVEL;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var MODULE_NAME = 'AUDIENCE_EVALUATOR';


/**
 * Construct an instance of AudienceEvaluator with given options
 * @param {Object=} UNSTABLE_conditionEvaluators A map of condition evaluators provided by the consumer. This enables matching
 *                                                   condition types which are not supported natively by the SDK. Note that built in
 *                                                   Optimizely evaluators cannot be overridden.
 * @constructor
 */
function AudienceEvaluator(UNSTABLE_conditionEvaluators) {
  this.typeToEvaluatorMap = fns.assignIn({}, UNSTABLE_conditionEvaluators, {
    'custom_attribute': customAttributeConditionEvaluator
  });
}

/**
 * Determine if the given user attributes satisfy the given audience conditions
 * @param  {Array|String|null|undefined}  audienceConditions    Audience conditions to match the user attributes against - can be an array
 *                                                              of audience IDs, a nested array of conditions, or a single leaf condition.
 *                                                              Examples: ["5", "6"], ["and", ["or", "1", "2"], "3"], "1"
 * @param  {Object}                       audiencesById         Object providing access to full audience objects for audience IDs
 *                                                              contained in audienceConditions. Keys should be audience IDs, values
 *                                                              should be full audience objects with conditions properties
 * @param  {Object}                       [userAttributes]      User attributes which will be used in determining if audience conditions
 *                                                              are met. If not provided, defaults to an empty object
 * @return {Boolean}                                            true if the user attributes match the given audience conditions, false
 *                                                              otherwise
 */
AudienceEvaluator.prototype.evaluate = function(audienceConditions, audiencesById, userAttributes) {
  // if there are no audiences, return true because that means ALL users are included in the experiment
  if (!audienceConditions || audienceConditions.length === 0) {
    return true;
  }

  if (!userAttributes) {
    userAttributes = {};
  }

  var evaluateAudience = function(audienceId) {
    var audience = audiencesById[audienceId];
    if (audience) {
      logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.EVALUATING_AUDIENCE, MODULE_NAME, audienceId, JSON.stringify(audience.conditions)));
      var result = conditionTreeEvaluator.evaluate(audience.conditions, this.evaluateConditionWithUserAttributes.bind(this, userAttributes));
      var resultText = result === null ? 'UNKNOWN' : result.toString().toUpperCase();
      logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.AUDIENCE_EVALUATION_RESULT, MODULE_NAME, audienceId, resultText));
      return result;
    }

    return null;
  }.bind(this);

  return conditionTreeEvaluator.evaluate(audienceConditions, evaluateAudience) || false;
};

/**
 * Wrapper around evaluator.evaluate that is passed to the conditionTreeEvaluator.
 * Evaluates the condition provided given the user attributes if an evaluator has been defined for the condition type.
 * @param  {Object} userAttributes     A map of user attributes.
 * @param  {Object} condition          A single condition object to evaluate.
 * @return {Boolean|null}              true if the condition is satisfied, null if a matcher is not found.
 */
AudienceEvaluator.prototype.evaluateConditionWithUserAttributes = function(userAttributes, condition) {
  var evaluator = this.typeToEvaluatorMap[condition.type];
  if (!evaluator) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNKNOWN_CONDITION_TYPE, MODULE_NAME, JSON.stringify(condition)));
    return null;
  }
  try {
    return evaluator.evaluate(condition, userAttributes, logger);
  } catch (err) {
    logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.CONDITION_EVALUATOR_ERROR, MODULE_NAME, condition.type, err.message));
  }
  return null;
};

module.exports = AudienceEvaluator;

},{"../../utils/enums":46,"../../utils/fns":50,"../condition_tree_evaluator":29,"../custom_attribute_condition_evaluator":30,"@optimizely/js-sdk-logging":22,"@optimizely/js-sdk-utils":26}],28:[function(require,module,exports){
/**
 * Copyright 2016, 2019 Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Bucketer API for determining the variation id from the specified parameters
 */
var enums = require('../../utils/enums');
var murmurhash = require('murmurhash');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var ERROR_MESSAGES = enums.ERROR_MESSAGES;
var HASH_SEED = 1;
var LOG_LEVEL = enums.LOG_LEVEL;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var MAX_HASH_VALUE = Math.pow(2, 32);
var MAX_TRAFFIC_VALUE = 10000;
var MODULE_NAME = 'BUCKETER';
var RANDOM_POLICY = 'random';

module.exports = {
  /**
   * Determines ID of variation to be shown for the given input params
   * @param  {Object}         bucketerParams
   * @param  {string}         bucketerParams.experimentId
   * @param  {string}         bucketerParams.experimentKey
   * @param  {string}         bucketerParams.userId
   * @param  {Object[]}       bucketerParams.trafficAllocationConfig
   * @param  {Array}          bucketerParams.experimentKeyMap
   * @param  {Object}         bucketerParams.groupIdMap
   * @param  {Object}         bucketerParams.variationIdMap
   * @param  {string}         bucketerParams.varationIdMap[].key
   * @param  {Object}         bucketerParams.logger
   * @param  {string}         bucketerParams.bucketingId
   * @return Variation ID that user has been bucketed into, null if user is not bucketed into any experiment
   */
  bucket: function(bucketerParams) {
    // Check if user is in a random group; if so, check if user is bucketed into a specific experiment
    var experiment = bucketerParams.experimentKeyMap[bucketerParams.experimentKey];
    var groupId = experiment['groupId'];
    if (groupId) {
      var group = bucketerParams.groupIdMap[groupId];
      if (!group) {
        throw new Error(sprintf(ERROR_MESSAGES.INVALID_GROUP_ID, MODULE_NAME, groupId));
      }
      if (group.policy === RANDOM_POLICY) {
        var bucketedExperimentId = module.exports.bucketUserIntoExperiment(group,
                                                                          bucketerParams.bucketingId,
                                                                          bucketerParams.userId,
                                                                          bucketerParams.logger);

        // Return if user is not bucketed into any experiment
        if (bucketedExperimentId === null) {
          var notbucketedInAnyExperimentLogMessage = sprintf(LOG_MESSAGES.USER_NOT_IN_ANY_EXPERIMENT, MODULE_NAME, bucketerParams.userId, groupId);
          bucketerParams.logger.log(LOG_LEVEL.INFO, notbucketedInAnyExperimentLogMessage);
          return null;
        }

        // Return if user is bucketed into a different experiment than the one specified
        if (bucketedExperimentId !== bucketerParams.experimentId) {
          var notBucketedIntoExperimentOfGroupLogMessage = sprintf(LOG_MESSAGES.USER_NOT_BUCKETED_INTO_EXPERIMENT_IN_GROUP, MODULE_NAME, bucketerParams.userId, bucketerParams.experimentKey, groupId);
          bucketerParams.logger.log(LOG_LEVEL.INFO, notBucketedIntoExperimentOfGroupLogMessage);
          return null;
        }

        // Continue bucketing if user is bucketed into specified experiment
        var bucketedIntoExperimentOfGroupLogMessage = sprintf(LOG_MESSAGES.USER_BUCKETED_INTO_EXPERIMENT_IN_GROUP, MODULE_NAME, bucketerParams.userId, bucketerParams.experimentKey, groupId);
        bucketerParams.logger.log(LOG_LEVEL.INFO, bucketedIntoExperimentOfGroupLogMessage);
      }
    }
    var bucketingId = sprintf('%s%s', bucketerParams.bucketingId, bucketerParams.experimentId);
    var bucketValue = module.exports._generateBucketValue(bucketingId);

    var bucketedUserLogMessage = sprintf(LOG_MESSAGES.USER_ASSIGNED_TO_VARIATION_BUCKET, MODULE_NAME, bucketValue, bucketerParams.userId);
    bucketerParams.logger.log(LOG_LEVEL.DEBUG, bucketedUserLogMessage);

    var entityId = module.exports._findBucket(bucketValue, bucketerParams.trafficAllocationConfig);
    if (!entityId) {
      var userHasNoVariationLogMessage = sprintf(LOG_MESSAGES.USER_HAS_NO_VARIATION, MODULE_NAME, bucketerParams.userId, bucketerParams.experimentKey);
      bucketerParams.logger.log(LOG_LEVEL.DEBUG, userHasNoVariationLogMessage);
    } else if (!bucketerParams.variationIdMap.hasOwnProperty(entityId)) {
      var invalidVariationIdLogMessage = sprintf(LOG_MESSAGES.INVALID_VARIATION_ID, MODULE_NAME);
      bucketerParams.logger.log(LOG_LEVEL.WARNING, invalidVariationIdLogMessage);
      return null;
    } else {
      var variationKey = bucketerParams.variationIdMap[entityId].key;
      var userInVariationLogMessage = sprintf(LOG_MESSAGES.USER_HAS_VARIATION, MODULE_NAME, bucketerParams.userId, variationKey, bucketerParams.experimentKey);
      bucketerParams.logger.log(LOG_LEVEL.INFO, userInVariationLogMessage);
    }

    return entityId;
  },

  /**
   * Returns bucketed experiment ID to compare against experiment user is being called into
   * @param {Object} group        Group that experiment is in
   * @param {string} bucketingId  Bucketing ID
   * @param {string} userId       ID of user to be bucketed into experiment
   * @param {Object} logger       Logger implementation
   * @return {string} ID of experiment if user is bucketed into experiment within the group, null otherwise
   */
  bucketUserIntoExperiment: function(group, bucketingId, userId, logger) {
    var bucketingKey = sprintf('%s%s', bucketingId, group.id);
    var bucketValue = module.exports._generateBucketValue(bucketingKey);
    logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_ASSIGNED_TO_EXPERIMENT_BUCKET, MODULE_NAME, bucketValue, userId));
    var trafficAllocationConfig = group.trafficAllocation;
    var bucketedExperimentId = module.exports._findBucket(bucketValue, trafficAllocationConfig);
    return bucketedExperimentId;
  },

  /**
   * Returns entity ID associated with bucket value
   * @param  {string}   bucketValue
   * @param  {Object[]} trafficAllocationConfig
   * @param  {number}   trafficAllocationConfig[].endOfRange
   * @param  {number}   trafficAllocationConfig[].entityId
   * @return {string}   Entity ID for bucketing if bucket value is within traffic allocation boundaries, null otherwise
   */
  _findBucket: function(bucketValue, trafficAllocationConfig) {
    for (var i = 0; i < trafficAllocationConfig.length; i++) {
      if (bucketValue < trafficAllocationConfig[i].endOfRange) {
        return trafficAllocationConfig[i].entityId;
      }
    }
    return null;
  },

  /**
   * Helper function to generate bucket value in half-closed interval [0, MAX_TRAFFIC_VALUE)
   * @param  {string} bucketingKey String value for bucketing
   * @return {string} the generated bucket value
   * @throws If bucketing value is not a valid string
   */
  _generateBucketValue: function(bucketingKey) {
    try {
      // NOTE: the mmh library already does cast the hash value as an unsigned 32bit int
      // https://github.com/perezd/node-murmurhash/blob/master/murmurhash.js#L115
      var hashValue = murmurhash.v3(bucketingKey, HASH_SEED);
      var ratio = hashValue / MAX_HASH_VALUE;
      return parseInt(ratio * MAX_TRAFFIC_VALUE, 10);
    } catch (ex) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_BUCKETING_ID, MODULE_NAME, bucketingKey, ex.message));
    }
  },
};

},{"../../utils/enums":46,"@optimizely/js-sdk-utils":26,"murmurhash":232}],29:[function(require,module,exports){
/****************************************************************************
 * Copyright 2018, Optimizely, Inc. and contributors                        *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

var AND_CONDITION = 'and';
var OR_CONDITION = 'or';
var NOT_CONDITION = 'not';

var DEFAULT_OPERATOR_TYPES = [AND_CONDITION, OR_CONDITION, NOT_CONDITION];

/**
 * Top level method to evaluate conditions
 * @param  {Array|*}    conditions      Nested array of and/or conditions, or a single leaf
 *                                      condition value of any type
 *                                      Example: ['and', '0', ['or', '1', '2']]
 * @param  {Function}   leafEvaluator   Function which will be called to evaluate leaf condition
 *                                      values
 * @return {?Boolean}                   Result of evaluating the conditions using the operator
 *                                      rules and the leaf evaluator. A return value of null
 *                                      indicates that the conditions are invalid or unable to be
 *                                      evaluated
 */
function evaluate(conditions, leafEvaluator) {
  if (Array.isArray(conditions)) {
    var firstOperator = conditions[0];
    var restOfConditions = conditions.slice(1);

    if (DEFAULT_OPERATOR_TYPES.indexOf(firstOperator) === -1) {
      // Operator to apply is not explicit - assume 'or'
      firstOperator = OR_CONDITION;
      restOfConditions = conditions;
    }

    switch (firstOperator) {
      case AND_CONDITION:
        return andEvaluator(restOfConditions, leafEvaluator);
      case NOT_CONDITION:
        return notEvaluator(restOfConditions, leafEvaluator);
      default: // firstOperator is OR_CONDITION
        return orEvaluator(restOfConditions, leafEvaluator);
    }
  }

  var leafCondition = conditions;
  return leafEvaluator(leafCondition);
}

/**
 * Evaluates an array of conditions as if the evaluator had been applied
 * to each entry and the results AND-ed together.
 * @param  {Array}      conditions      Array of conditions ex: [operand_1, operand_2]
 * @param  {Function}   leafEvaluator   Function which will be called to evaluate leaf condition values
 * @return {?Boolean}                   Result of evaluating the conditions. A return value of null
 *                                      indicates that the conditions are invalid or unable to be
 *                                      evaluated.
 */
function andEvaluator(conditions, leafEvaluator) {
  var sawNullResult = false;
  for (var i = 0; i < conditions.length; i++) {
    var conditionResult = evaluate(conditions[i], leafEvaluator);
    if (conditionResult === false) {
      return false;
    }
    if (conditionResult === null) {
      sawNullResult = true;
    }
  }
  return sawNullResult ? null : true;
}

/**
 * Evaluates an array of conditions as if the evaluator had been applied
 * to a single entry and NOT was applied to the result.
 * @param  {Array}      conditions      Array of conditions ex: [operand_1]
 * @param  {Function}   leafEvaluator   Function which will be called to evaluate leaf condition values
 * @return {?Boolean}                   Result of evaluating the conditions. A return value of null
 *                                      indicates that the conditions are invalid or unable to be
 *                                      evaluated.
 */
function notEvaluator(conditions, leafEvaluator) {
  if (conditions.length > 0) {
    var result = evaluate(conditions[0], leafEvaluator);
    return result === null ? null : !result;
  }
  return null;
}

/**
 * Evaluates an array of conditions as if the evaluator had been applied
 * to each entry and the results OR-ed together.
 * @param  {Array}      conditions      Array of conditions ex: [operand_1, operand_2]
 * @param  {Function}   leafEvaluator   Function which will be called to evaluate leaf condition values
 * @return {?Boolean}                   Result of evaluating the conditions. A return value of null
 *                                      indicates that the conditions are invalid or unable to be
 *                                      evaluated.
 */
function orEvaluator(conditions, leafEvaluator) {
  var sawNullResult = false;
  for (var i = 0; i < conditions.length; i++) {
    var conditionResult = evaluate(conditions[i], leafEvaluator);
    if (conditionResult === true) {
      return true;
    }
    if (conditionResult === null) {
      sawNullResult = true;
    }
  }
  return sawNullResult ? null : false;
}

module.exports = {
  evaluate: evaluate,
};

},{}],30:[function(require,module,exports){
/****************************************************************************
 * Copyright 2018-2019, Optimizely, Inc. and contributors                        *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

var fns = require('../../utils/fns');
var enums = require('../../utils/enums');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var LOG_LEVEL = enums.LOG_LEVEL;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var MODULE_NAME = 'CUSTOM_ATTRIBUTE_CONDITION_EVALUATOR';

var EXACT_MATCH_TYPE = 'exact';
var EXISTS_MATCH_TYPE = 'exists';
var GREATER_THAN_MATCH_TYPE = 'gt';
var LESS_THAN_MATCH_TYPE = 'lt';
var SUBSTRING_MATCH_TYPE = 'substring';

var MATCH_TYPES = [
  EXACT_MATCH_TYPE,
  EXISTS_MATCH_TYPE,
  GREATER_THAN_MATCH_TYPE,
  LESS_THAN_MATCH_TYPE,
  SUBSTRING_MATCH_TYPE,
];

var EVALUATORS_BY_MATCH_TYPE = {};
EVALUATORS_BY_MATCH_TYPE[EXACT_MATCH_TYPE] = exactEvaluator;
EVALUATORS_BY_MATCH_TYPE[EXISTS_MATCH_TYPE] = existsEvaluator;
EVALUATORS_BY_MATCH_TYPE[GREATER_THAN_MATCH_TYPE] = greaterThanEvaluator;
EVALUATORS_BY_MATCH_TYPE[LESS_THAN_MATCH_TYPE] = lessThanEvaluator;
EVALUATORS_BY_MATCH_TYPE[SUBSTRING_MATCH_TYPE] = substringEvaluator;

/**
 * Given a custom attribute audience condition and user attributes, evaluate the
 * condition against the attributes.
 * @param  {Object}     condition
 * @param  {Object}     userAttributes
 * @param  {Object}     logger
 * @return {?Boolean}   true/false if the given user attributes match/don't match the given condition,
 *                                      null if the given user attributes and condition can't be evaluated
 * TODO: Change to accept and object with named properties
 */
function evaluate(condition, userAttributes, logger) {
  var conditionMatch = condition.match;
  if (typeof conditionMatch !== 'undefined' && MATCH_TYPES.indexOf(conditionMatch) === -1) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNKNOWN_MATCH_TYPE, MODULE_NAME, JSON.stringify(condition)));
    return null;
  }

  var attributeKey = condition.name;
  if (!userAttributes.hasOwnProperty(attributeKey) && conditionMatch != EXISTS_MATCH_TYPE) {
    logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.MISSING_ATTRIBUTE_VALUE, MODULE_NAME, JSON.stringify(condition), attributeKey));
    return null;
  }

  var evaluatorForMatch = EVALUATORS_BY_MATCH_TYPE[conditionMatch] || exactEvaluator;
  return evaluatorForMatch(condition, userAttributes, logger);
}

/**
 * Returns true if the value is valid for exact conditions. Valid values include
 * strings, booleans, and numbers that aren't NaN, -Infinity, or Infinity.
 * @param value
 * @returns {Boolean}
 */
function isValueTypeValidForExactConditions(value) {
  return typeof value === 'string' || typeof value === 'boolean' ||
    fns.isNumber(value);
}

/**
 * Evaluate the given exact match condition for the given user attributes
 * @param   {Object}    condition
 * @param   {Object}    userAttributes
 * @param   {Object}    logger
 * @return  {?Boolean}  true if the user attribute value is equal (===) to the condition value,
 *                      false if the user attribute value is not equal (!==) to the condition value,
 *                      null if the condition value or user attribute value has an invalid type, or
 *                      if there is a mismatch between the user attribute type and the condition value
 *                      type
 */
function exactEvaluator(condition, userAttributes, logger) {
  var conditionValue = condition.value;
  var conditionValueType = typeof conditionValue;
  var conditionName = condition.name;
  var userValue = userAttributes[conditionName];
  var userValueType = typeof userValue;

  if (!isValueTypeValidForExactConditions(conditionValue) || (fns.isNumber(conditionValue) && !fns.isFinite(conditionValue))) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_CONDITION_VALUE, MODULE_NAME, JSON.stringify(condition)));
    return null;
  }

  if (userValue === null) {
    logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE_NULL, MODULE_NAME, JSON.stringify(condition), conditionName));
    return null;
  }

  if (!isValueTypeValidForExactConditions(userValue) || conditionValueType !== userValueType) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE, MODULE_NAME, JSON.stringify(condition), userValueType, conditionName));
    return null;
  }

  if (fns.isNumber(userValue) && !fns.isFinite(userValue)) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.OUT_OF_BOUNDS, MODULE_NAME, JSON.stringify(condition), conditionName));
    return null;
  }

  return conditionValue === userValue;
}

/**
 * Evaluate the given exists match condition for the given user attributes
 * @param   {Object}  condition
 * @param   {Object}  userAttributes
 * @returns {Boolean} true if both:
 *                      1) the user attributes have a value for the given condition, and
 *                      2) the user attribute value is neither null nor undefined
 *                    Returns false otherwise
 */
function existsEvaluator(condition, userAttributes) {
  var userValue = userAttributes[condition.name];
  return typeof userValue !== 'undefined' && userValue !== null;
}

/**
 * Evaluate the given greater than match condition for the given user attributes
 * @param   {Object}    condition
 * @param   {Object}    userAttributes
 * @param   {Object}    logger
 * @returns {?Boolean}  true if the user attribute value is greater than the condition value,
 *                      false if the user attribute value is less than or equal to the condition value,
 *                      null if the condition value isn't a number or the user attribute value
 *                      isn't a number
 */
function greaterThanEvaluator(condition, userAttributes, logger) {
  var conditionName = condition.name;
  var userValue = userAttributes[conditionName];
  var userValueType = typeof userValue;
  var conditionValue = condition.value;

  if (!fns.isFinite(conditionValue)) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_CONDITION_VALUE, MODULE_NAME, JSON.stringify(condition)));
    return null;
  }

  if (userValue === null) {
    logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE_NULL, MODULE_NAME, JSON.stringify(condition), conditionName));
    return null;
  }

  if (!fns.isNumber(userValue)) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE, MODULE_NAME, JSON.stringify(condition), userValueType, conditionName));
    return null;
  }

  if (!fns.isFinite(userValue)) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.OUT_OF_BOUNDS, MODULE_NAME, JSON.stringify(condition), conditionName));
    return null;
  }

  return userValue > conditionValue;
}

/**
 * Evaluate the given less than match condition for the given user attributes
 * @param   {Object}    condition
 * @param   {Object}    userAttributes
 * @param   {Object}    logger
 * @returns {?Boolean}  true if the user attribute value is less than the condition value,
 *                      false if the user attribute value is greater than or equal to the condition value,
 *                      null if the condition value isn't a number or the user attribute value isn't a
 *                      number
 */
function lessThanEvaluator(condition, userAttributes, logger) {
  var conditionName = condition.name;
  var userValue = userAttributes[condition.name];
  var userValueType = typeof userValue;
  var conditionValue = condition.value;

  if (!fns.isFinite(conditionValue)) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_CONDITION_VALUE, MODULE_NAME, JSON.stringify(condition)));
    return null;
  }

  if (userValue === null) {
    logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE_NULL, MODULE_NAME, JSON.stringify(condition), conditionName));
    return null;
  }

  if (!fns.isNumber(userValue)) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE, MODULE_NAME, JSON.stringify(condition), userValueType, conditionName));
    return null;
  }

  if (!fns.isFinite(userValue)) {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.OUT_OF_BOUNDS, MODULE_NAME, JSON.stringify(condition), conditionName));
    return null;
  }

  return userValue < conditionValue;
}

/**
 * Evaluate the given substring match condition for the given user attributes
 * @param   {Object}    condition
 * @param   {Object}    userAttributes
 * @param   {Object}    logger
 * @returns {?Boolean}  true if the condition value is a substring of the user attribute value,
 *                      false if the condition value is not a substring of the user attribute value,
 *                      null if the condition value isn't a string or the user attribute value
 *                      isn't a string
 */
function substringEvaluator(condition, userAttributes, logger) {
  var conditionName = condition.name;
  var userValue = userAttributes[condition.name];
  var userValueType = typeof userValue;
  var conditionValue = condition.value;

  if (typeof conditionValue !== 'string') {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_CONDITION_VALUE, MODULE_NAME, JSON.stringify(condition)));
    return null;
  }

  if (userValue === null) {
    logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE_NULL, MODULE_NAME, JSON.stringify(condition), conditionName));
    return null;
  }

  if (typeof userValue !== 'string') {
    logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.UNEXPECTED_TYPE, MODULE_NAME, JSON.stringify(condition), userValueType, conditionName));
    return null;
  }

  return userValue.indexOf(conditionValue) !== -1;
}

module.exports = {
  evaluate: evaluate
};

},{"../../utils/enums":46,"../../utils/fns":50,"@optimizely/js-sdk-utils":26}],31:[function(require,module,exports){
/****************************************************************************
 * Copyright 2017-2019, Optimizely, Inc. and contributors                   *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

var AudienceEvaluator = require('../audience_evaluator');
var bucketer = require('../bucketer');
var enums = require('../../utils/enums');
var fns = require('../../utils/fns');
var projectConfig = require('../project_config');
var stringValidator = require('../../utils/string_value_validator');

var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var MODULE_NAME = 'DECISION_SERVICE';
var ERROR_MESSAGES = enums.ERROR_MESSAGES;
var LOG_LEVEL = enums.LOG_LEVEL;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var DECISION_SOURCES = enums.DECISION_SOURCES;



/**
 * Optimizely's decision service that determines which variation of an experiment the user will be allocated to.
 *
 * The decision service contains all logic around how a user decision is made. This includes all of the following (in order):
 *   1. Checking experiment status
 *   2. Checking forced bucketing
 *   3. Checking whitelisting
 *   4. Checking user profile service for past bucketing decisions (sticky bucketing)
 *   5. Checking audience targeting
 *   6. Using Murmurhash3 to bucket the user.
 *
 * @constructor
 * @param   {Object} options
 * @param   {Object} options.userProfileService An instance of the user profile service for sticky bucketing.
 * @param   {Object} options.logger An instance of a logger to log messages.
 * @returns {Object}
 */
function DecisionService(options) {
  this.audienceEvaluator = new AudienceEvaluator(options.UNSTABLE_conditionEvaluators);
  this.forcedVariationMap = {};
  this.logger = options.logger;
  this.userProfileService = options.userProfileService || null;
}

/**
 * Gets variation where visitor will be bucketed.
 * @param  {Object}      configObj      The parsed project configuration object
 * @param  {string}      experimentKey
 * @param  {string}      userId
 * @param  {Object}      attributes
 * @return {string|null} the variation the user is bucketed into.
 */
DecisionService.prototype.getVariation = function(configObj, experimentKey, userId, attributes) {
  // by default, the bucketing ID should be the user ID
  var bucketingId = this._getBucketingId(userId, attributes);

  if (!this.__checkIfExperimentIsActive(configObj, experimentKey)) {
    return null;
  }
  var experiment = configObj.experimentKeyMap[experimentKey];
  var forcedVariationKey = this.getForcedVariation(configObj, experimentKey, userId);
  if (forcedVariationKey) {
    return forcedVariationKey;
  }

  var variation = this.__getWhitelistedVariation(experiment, userId);
  if (variation) {
    return variation.key;
  }

  // check for sticky bucketing
  var experimentBucketMap = this.__resolveExperimentBucketMap(userId, attributes);
  variation = this.__getStoredVariation(configObj, experiment, userId, experimentBucketMap);
  if (variation) {
    this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.RETURNING_STORED_VARIATION, MODULE_NAME, variation.key, experimentKey, userId));
    return variation.key;
  }

  // Perform regular targeting and bucketing
  if (!this.__checkIfUserIsInAudience(configObj, experimentKey, userId, attributes)) {
    return null;
  }

  var bucketerParams = this.__buildBucketerParams(configObj, experimentKey, bucketingId, userId);
  var variationId = bucketer.bucket(bucketerParams);
  variation = configObj.variationIdMap[variationId];
  if (!variation) {
    return null;
  }

  // persist bucketing
  this.__saveUserProfile(experiment, variation, userId, experimentBucketMap);

  return variation.key;
};

/**
 * Merges attributes from attributes[STICKY_BUCKETING_KEY] and userProfileService
 * @param  {Object} attributes
 * @return {Object} finalized copy of experiment_bucket_map
 */
DecisionService.prototype.__resolveExperimentBucketMap = function(userId, attributes) {
  attributes = attributes || {}
  var userProfile = this.__getUserProfile(userId) || {};
  var attributeExperimentBucketMap = attributes[enums.CONTROL_ATTRIBUTES.STICKY_BUCKETING_KEY];
  return fns.assignIn({}, userProfile.experiment_bucket_map, attributeExperimentBucketMap);
};


/**
 * Checks whether the experiment is running
 * @param  {Object}  configObj     The parsed project configuration object
 * @param  {string}  experimentKey Key of experiment being validated
 * @param  {string}  userId        ID of user
 * @return {boolean} True if experiment is running
 */
DecisionService.prototype.__checkIfExperimentIsActive = function(configObj, experimentKey) {
  if (!projectConfig.isActive(configObj, experimentKey)) {
    var experimentNotRunningLogMessage = sprintf(LOG_MESSAGES.EXPERIMENT_NOT_RUNNING, MODULE_NAME, experimentKey);
    this.logger.log(LOG_LEVEL.INFO, experimentNotRunningLogMessage);
    return false;
  }

  return true;
};

/**
 * Checks if user is whitelisted into any variation and return that variation if so
 * @param  {Object} experiment
 * @param  {string} userId
 * @return {string|null} Forced variation if it exists for user ID, otherwise null
 */
DecisionService.prototype.__getWhitelistedVariation = function(experiment, userId) {
  if (!fns.isEmpty(experiment.forcedVariations) && experiment.forcedVariations.hasOwnProperty(userId)) {
    var forcedVariationKey = experiment.forcedVariations[userId];
    if (experiment.variationKeyMap.hasOwnProperty(forcedVariationKey)) {
      var forcedBucketingSucceededMessageLog = sprintf(LOG_MESSAGES.USER_FORCED_IN_VARIATION, MODULE_NAME, userId, forcedVariationKey);
      this.logger.log(LOG_LEVEL.INFO, forcedBucketingSucceededMessageLog);
      return experiment.variationKeyMap[forcedVariationKey];
    } else {
      var forcedBucketingFailedMessageLog = sprintf(LOG_MESSAGES.FORCED_BUCKETING_FAILED, MODULE_NAME, forcedVariationKey, userId);
      this.logger.log(LOG_LEVEL.ERROR, forcedBucketingFailedMessageLog);
      return null;
    }
  }

  return null;
};

/**
 * Checks whether the user is included in experiment audience
 * @param  {Object}  configObj     The parsed project configuration object
 * @param  {string}  experimentKey Key of experiment being validated
 * @param  {string}  userId        ID of user
 * @param  {Object}  attributes    Optional parameter for user's attributes
 * @return {boolean} True if user meets audience conditions
 */
DecisionService.prototype.__checkIfUserIsInAudience = function(configObj, experimentKey, userId, attributes) {
  var experimentAudienceConditions = projectConfig.getExperimentAudienceConditions(configObj, experimentKey);
  var audiencesById = projectConfig.getAudiencesById(configObj);
  this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.EVALUATING_AUDIENCES_COMBINED, MODULE_NAME, experimentKey, JSON.stringify(experimentAudienceConditions)));
  var result = this.audienceEvaluator.evaluate(experimentAudienceConditions, audiencesById, attributes);
  this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.AUDIENCE_EVALUATION_RESULT_COMBINED, MODULE_NAME, experimentKey, result.toString().toUpperCase()));

  if (!result) {
    var userDoesNotMeetConditionsLogMessage = sprintf(LOG_MESSAGES.USER_NOT_IN_EXPERIMENT, MODULE_NAME, userId, experimentKey);
    this.logger.log(LOG_LEVEL.INFO, userDoesNotMeetConditionsLogMessage);
    return false;
  }

  return true;
};

/**
 * Given an experiment key and user ID, returns params used in bucketer call
 * @param  configObj     The parsed project configuration object
 * @param  experimentKey Experiment key used for bucketer
 * @param  bucketingId   ID to bucket user into
 * @param  userId        ID of user to be bucketed
 * @return {Object}
 */
DecisionService.prototype.__buildBucketerParams = function(configObj, experimentKey, bucketingId, userId) {
  var bucketerParams = {};
  bucketerParams.experimentKey = experimentKey;
  bucketerParams.experimentId = projectConfig.getExperimentId(configObj, experimentKey);
  bucketerParams.userId = userId;
  bucketerParams.trafficAllocationConfig = projectConfig.getTrafficAllocation(configObj, experimentKey);
  bucketerParams.experimentKeyMap = configObj.experimentKeyMap;
  bucketerParams.groupIdMap = configObj.groupIdMap;
  bucketerParams.variationIdMap = configObj.variationIdMap;
  bucketerParams.logger = this.logger;
  bucketerParams.bucketingId = bucketingId;
  return bucketerParams;
};

/**
 * Pull the stored variation out of the experimentBucketMap for an experiment/userId
 * @param  {Object} configObj           The parsed project configuration object
 * @param  {Object} experiment
 * @param  {String} userId
 * @param  {Object} experimentBucketMap mapping experiment => { variation_id: <variationId> }
 * @return {Object} the stored variation or null if the user profile does not have one for the given experiment
 */
DecisionService.prototype.__getStoredVariation = function(configObj, experiment, userId, experimentBucketMap) {
  if (experimentBucketMap.hasOwnProperty(experiment.id)) {
    var decision = experimentBucketMap[experiment.id];
    var variationId = decision.variation_id;
    if (configObj.variationIdMap.hasOwnProperty(variationId)) {
      return configObj.variationIdMap[decision.variation_id];
    } else {
      this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.SAVED_VARIATION_NOT_FOUND, MODULE_NAME, userId, variationId, experiment.key));
    }
  }

  return null;
};

/**
 * Get the user profile with the given user ID
 * @param  {string} userId
 * @return {Object|undefined} the stored user profile or undefined if one isn't found
 */
DecisionService.prototype.__getUserProfile = function(userId) {
  var userProfile = {
    user_id: userId,
    experiment_bucket_map: {},
  };

  if (!this.userProfileService) {
    return userProfile;
  }

  try {
    return this.userProfileService.lookup(userId);
  } catch (ex) {
    this.logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.USER_PROFILE_LOOKUP_ERROR, MODULE_NAME, userId, ex.message));
  }
};

/**
 * Saves the bucketing decision to the user profile
 * @param {Object} userProfile
 * @param {Object} experiment
 * @param {Object} variation
 * @param {Object} experimentBucketMap
 */
DecisionService.prototype.__saveUserProfile = function(experiment, variation, userId, experimentBucketMap) {
  if (!this.userProfileService) {
    return;
  }

  try {
    var newBucketMap = fns.cloneDeep(experimentBucketMap);
    newBucketMap[experiment.id] = {
      variation_id: variation.id
    };

    this.userProfileService.save({
      user_id: userId,
      experiment_bucket_map: newBucketMap,
    });

    this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.SAVED_VARIATION, MODULE_NAME, variation.key, experiment.key, userId));
  } catch (ex) {
    this.logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.USER_PROFILE_SAVE_ERROR, MODULE_NAME, userId, ex.message));
  }
};

/**
 * Given a feature, user ID, and attributes, returns an object representing a
 * decision. If the user was bucketed into a variation for the given feature
 * and attributes, the returned decision object will have variation and
 * experiment properties (both objects), as well as a decisionSource property.
 * decisionSource indicates whether the decision was due to a rollout or an
 * experiment.
 * @param   {Object} configObj  The parsed project configuration object
 * @param   {Object} feature    A feature flag object from project configuration
 * @param   {String} userId     A string identifying the user, for bucketing
 * @param   {Object} attributes Optional user attributes
 * @return  {Object} An object with experiment, variation, and decisionSource
 * properties. If the user was not bucketed into a variation, the variation
 * property is null.
 */
DecisionService.prototype.getVariationForFeature = function(configObj, feature, userId, attributes) {
  var experimentDecision = this._getVariationForFeatureExperiment(configObj, feature, userId, attributes);
  if (experimentDecision.variation !== null) {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_IN_FEATURE_EXPERIMENT, MODULE_NAME, userId, experimentDecision.variation.key, experimentDecision.experiment.key, feature.key));
    return experimentDecision;
  }

  this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_NOT_IN_FEATURE_EXPERIMENT, MODULE_NAME, userId, feature.key));

  var rolloutDecision = this._getVariationForRollout(configObj, feature, userId, attributes);
  if (rolloutDecision.variation !== null) {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_IN_ROLLOUT, MODULE_NAME, userId, feature.key));
    return rolloutDecision;
  }

  this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_NOT_IN_ROLLOUT, MODULE_NAME, userId, feature.key));
  return rolloutDecision;
};

DecisionService.prototype._getVariationForFeatureExperiment = function(configObj, feature, userId, attributes) {
  var experiment = null;
  var variationKey = null;

  if (feature.hasOwnProperty('groupId')) {
    var group = configObj.groupIdMap[feature.groupId];
    if (group) {
      experiment = this._getExperimentInGroup(configObj, group, userId);
      if (experiment && feature.experimentIds.indexOf(experiment.id) !== -1) {
        variationKey = this.getVariation(configObj, experiment.key, userId, attributes);
      }
    }
  } else if (feature.experimentIds.length > 0) {
    // If the feature does not have a group ID, then it can only be associated
    // with one experiment, so we look at the first experiment ID only
    experiment = projectConfig.getExperimentFromId(configObj, feature.experimentIds[0], this.logger);
    if (experiment) {
      variationKey = this.getVariation(configObj, experiment.key, userId, attributes);
    }
  } else {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.FEATURE_HAS_NO_EXPERIMENTS, MODULE_NAME, feature.key));
  }

  var variation = null;
  if (variationKey !== null && experiment !== null) {
    variation = experiment.variationKeyMap[variationKey];
  }
  return {
    experiment: experiment,
    variation: variation,
    decisionSource: DECISION_SOURCES.FEATURE_TEST,
  };
};

DecisionService.prototype._getExperimentInGroup = function(configObj, group, userId) {
  var experimentId = bucketer.bucketUserIntoExperiment(group, userId, userId, this.logger);
  if (experimentId) {
    this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.USER_BUCKETED_INTO_EXPERIMENT_IN_GROUP, MODULE_NAME, userId, experimentId, group.id));
    var experiment = projectConfig.getExperimentFromId(configObj, experimentId, this.logger);
    if (experiment) {
      return experiment;
    }
  }

  this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.USER_NOT_BUCKETED_INTO_ANY_EXPERIMENT_IN_GROUP, MODULE_NAME, userId, group.id));
  return null;
};

DecisionService.prototype._getVariationForRollout = function(configObj, feature, userId, attributes) {
  if (!feature.rolloutId) {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.NO_ROLLOUT_EXISTS, MODULE_NAME, feature.key));
    return {
      experiment: null,
      variation: null,
      decisionSource: DECISION_SOURCES.ROLLOUT,
    };
  }

  var rollout = configObj.rolloutIdMap[feature.rolloutId];
  if (!rollout) {
    this.logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.INVALID_ROLLOUT_ID, MODULE_NAME, feature.rolloutId, feature.key));
    return {
      experiment: null,
      variation: null,
      decisionSource: DECISION_SOURCES.ROLLOUT,
    };
  }

  if (rollout.experiments.length === 0) {
    this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.ROLLOUT_HAS_NO_EXPERIMENTS, MODULE_NAME, feature.rolloutId));
    return {
      experiment: null,
      variation: null,
      decisionSource: DECISION_SOURCES.ROLLOUT,
    };
  }

  var bucketingId = this._getBucketingId(userId, attributes);

  // The end index is length - 1 because the last experiment is assumed to be
  // "everyone else", which will be evaluated separately outside this loop
  var endIndex = rollout.experiments.length - 1;
  var index;
  var experiment;
  var bucketerParams;
  var variationId;
  var variation;
  for (index = 0; index < endIndex; index++) {
    experiment = configObj.experimentKeyMap[rollout.experiments[index].key];

    if (!this.__checkIfUserIsInAudience(configObj, experiment.key, userId, attributes)) {
      this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_DOESNT_MEET_CONDITIONS_FOR_TARGETING_RULE, MODULE_NAME, userId, index + 1));
      continue;
    }

    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_MEETS_CONDITIONS_FOR_TARGETING_RULE, MODULE_NAME, userId, index + 1));
    bucketerParams = this.__buildBucketerParams(configObj, experiment.key, bucketingId, userId);
    variationId = bucketer.bucket(bucketerParams);
    variation = configObj.variationIdMap[variationId];
    if (variation) {
      this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_BUCKETED_INTO_TARGETING_RULE, MODULE_NAME, userId, index + 1));
      return {
        experiment: experiment,
        variation: variation,
        decisionSource: DECISION_SOURCES.ROLLOUT,
      };
    } else {
      this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_NOT_BUCKETED_INTO_TARGETING_RULE, MODULE_NAME, userId, index + 1));
      break;
    }
  }

  var everyoneElseExperiment = configObj.experimentKeyMap[rollout.experiments[endIndex].key];
  if (this.__checkIfUserIsInAudience(configObj, everyoneElseExperiment.key, userId, attributes)) {
    bucketerParams = this.__buildBucketerParams(configObj, everyoneElseExperiment.key, bucketingId, userId);
    variationId = bucketer.bucket(bucketerParams);
    variation = configObj.variationIdMap[variationId];
    if (variation) {
      this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_BUCKETED_INTO_EVERYONE_TARGETING_RULE, MODULE_NAME, userId));
      return {
        experiment: everyoneElseExperiment,
        variation: variation,
        decisionSource: DECISION_SOURCES.ROLLOUT,
      };
    } else {
      this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_NOT_BUCKETED_INTO_EVERYONE_TARGETING_RULE, MODULE_NAME, userId));
    }
  }

  return {
    experiment: null,
    variation: null,
    decisionSource: DECISION_SOURCES.ROLLOUT,
  };
};

/**
 * Get bucketing Id from user attributes.
 * @param {String} userId
 * @param {Object} attributes
 * @returns {String} Bucketing Id if it is a string type in attributes, user Id otherwise.
 */
DecisionService.prototype._getBucketingId = function(userId, attributes) {
  var bucketingId = userId;

  // If the bucketing ID key is defined in attributes, than use that in place of the userID for the murmur hash key
  if ((attributes != null && typeof attributes === 'object') && attributes.hasOwnProperty(enums.CONTROL_ATTRIBUTES.BUCKETING_ID)) {
    if (typeof attributes[enums.CONTROL_ATTRIBUTES.BUCKETING_ID] === 'string') {
      bucketingId = attributes[enums.CONTROL_ATTRIBUTES.BUCKETING_ID];
      this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.VALID_BUCKETING_ID, MODULE_NAME, bucketingId));
    } else {
      this.logger.log(LOG_LEVEL.WARNING, sprintf(LOG_MESSAGES.BUCKETING_ID_NOT_STRING, MODULE_NAME));
    }
  }

  return bucketingId;
};

/**
 * Removes forced variation for given userId and experimentKey
 * @param  {string} userId         String representing the user id
 * @param  {number} experimentId   Number representing the experiment id
 * @param  {string} experimentKey  Key representing the experiment id
 * @throws If the user id is not valid or not in the forced variation map
 */
DecisionService.prototype.removeForcedVariation = function(userId, experimentId, experimentKey) {
  if (!userId) {
    throw new Error(sprintf(ERROR_MESSAGES.INVALID_USER_ID, MODULE_NAME));
  }

  if (this.forcedVariationMap.hasOwnProperty(userId)) {
    delete this.forcedVariationMap[userId][experimentId];
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.VARIATION_REMOVED_FOR_USER, MODULE_NAME, experimentKey, userId));
  } else {
    throw new Error(sprintf(ERROR_MESSAGES.USER_NOT_IN_FORCED_VARIATION, MODULE_NAME, userId));
  }
};

/**
 * Sets forced variation for given userId and experimentKey
 * @param  {string} userId        String representing the user id
 * @param  {number} experimentId  Number representing the experiment id
 * @param  {number} variationId   Number representing the variation id
 * @throws If the user id is not valid
 */
DecisionService.prototype.__setInForcedVariationMap = function(userId, experimentId, variationId) {
  if (this.forcedVariationMap.hasOwnProperty(userId)) {
    this.forcedVariationMap[userId][experimentId] = variationId;
  } else {
    this.forcedVariationMap[userId] = {};
    this.forcedVariationMap[userId][experimentId] = variationId;
  }

  this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_MAPPED_TO_FORCED_VARIATION, MODULE_NAME, variationId, experimentId, userId));
};

/**
 * Gets the forced variation key for the given user and experiment.
 * @param  {Object} configObj        Object representing project configuration
 * @param  {string} experimentKey    Key for experiment.
 * @param  {string} userId           The user Id.
 * @return {string|null} Variation   The variation which the given user and experiment should be forced into.
 */
DecisionService.prototype.getForcedVariation = function(configObj, experimentKey, userId) {
  var experimentToVariationMap = this.forcedVariationMap[userId];
  if (!experimentToVariationMap) {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_HAS_NO_FORCED_VARIATION, MODULE_NAME, userId));
    return null;
  }

  var experimentId;
  try {
    var experiment = projectConfig.getExperimentFromKey(configObj, experimentKey);
    if (experiment.hasOwnProperty('id')) {
      experimentId = experiment['id'];
    } else {
      // catching improperly formatted experiments
      this.logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.IMPROPERLY_FORMATTED_EXPERIMENT, MODULE_NAME, experimentKey));
      return null;
    }
  } catch (ex) {
    // catching experiment not in datafile
    this.logger.log(LOG_LEVEL.ERROR, ex.message);
    return null;
  }

  var variationId = experimentToVariationMap[experimentId];
  if (!variationId) {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_HAS_NO_FORCED_VARIATION_FOR_EXPERIMENT, MODULE_NAME, experimentKey, userId));
    return null;
  }

  var variationKey = projectConfig.getVariationKeyFromId(configObj, variationId);
  if (variationKey) {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_HAS_FORCED_VARIATION, MODULE_NAME, variationKey, experimentKey, userId));
  } else {
    this.logger.log(LOG_LEVEL.DEBUG, sprintf(LOG_MESSAGES.USER_HAS_NO_FORCED_VARIATION_FOR_EXPERIMENT, MODULE_NAME, experimentKey, userId));
  }

  return variationKey;
};

/**
 * Sets the forced variation for a user in a given experiment
 * @param  {Object} configObj      Object representing project configuration
 * @param  {string} experimentKey  Key for experiment.
 * @param  {string} userId         The user Id.
 * @param  {string} variationKey   Key for variation. If null, then clear the existing experiment-to-variation mapping
 * @return {boolean}               A boolean value that indicates if the set completed successfully.
 */
DecisionService.prototype.setForcedVariation = function(configObj, experimentKey, userId, variationKey) {
  if (variationKey != null && !stringValidator.validate(variationKey)) {
    this.logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.INVALID_VARIATION_KEY, MODULE_NAME));
    return false;
  }

  var experimentId;
  try {
    var experiment = projectConfig.getExperimentFromKey(configObj, experimentKey);
    if (experiment.hasOwnProperty('id')) {
      experimentId = experiment['id'];
    } else {
      // catching improperly formatted experiments
      this.logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.IMPROPERLY_FORMATTED_EXPERIMENT, MODULE_NAME, experimentKey));
      return false;
    }
  } catch (ex) {
    // catching experiment not in datafile
    this.logger.log(LOG_LEVEL.ERROR, ex.message);
    return false;
  }

  if (variationKey == null) {
    try {
      this.removeForcedVariation(userId, experimentId, experimentKey, this.logger);
      return true;
    } catch (ex) {
      this.logger.log(LOG_LEVEL.ERROR, ex.message);
      return false;
    }
  }

  var variationId = projectConfig.getVariationIdFromExperimentAndVariationKey(configObj, experimentKey, variationKey);

  if (!variationId) {
    this.logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.NO_VARIATION_FOR_EXPERIMENT_KEY, MODULE_NAME, variationKey, experimentKey));
    return false;
  }

  try {
    this.__setInForcedVariationMap(userId, experimentId, variationId);
    return true;
  } catch (ex) {
    this.logger.log(LOG_LEVEL.ERROR, ex.message);
    return false;
  }
};

module.exports = {
  /**
   * Creates an instance of the DecisionService.
   * @param  {Object} options               Configuration options
   * @param  {Object} options.userProfileService
   * @param  {Object} options.logger
   * @return {Object} An instance of the DecisionService
   */
  createDecisionService: function(options) {
    return new DecisionService(options);
  },
};

},{"../../utils/enums":46,"../../utils/fns":50,"../../utils/string_value_validator":51,"../audience_evaluator":27,"../bucketer":28,"../project_config":36,"@optimizely/js-sdk-utils":26}],32:[function(require,module,exports){
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var logging = require('@optimizely/js-sdk-logging');

var attributesValidator = require('../../utils/attributes_validator');
var fns = require('../../utils/fns');
var eventTagUtils = require('../../utils/event_tag_utils');
var projectConfig = require('../project_config');

var logger = logging.getLogger('EVENT_BUILDER');

/**
 * Creates an ImpressionEvent object from decision data
 * @param {Object} config
 * @param {Object} config.configObj
 * @param {String} config.experimentKey
 * @param {String} config.variationKey
 * @param {String} config.userId
 * @param {Object} config.userAttributes
 * @param {String} config.clientEngine
 * @param {String} config.clientVersion
 * @return {Object} an ImpressionEvent object
 */
exports.buildImpressionEvent = function buildImpressionEvent(config) {
  var configObj = config.configObj;
  var experimentKey = config.experimentKey;
  var variationKey = config.variationKey;
  var userId = config.userId;
  var userAttributes = config.userAttributes;
  var clientEngine = config.clientEngine;
  var clientVersion = config.clientVersion;

  var variationId = projectConfig.getVariationIdFromExperimentAndVariationKey(configObj, experimentKey, variationKey);
  var experimentId = projectConfig.getExperimentId(configObj, experimentKey);
  var layerId = projectConfig.getLayerId(configObj, experimentId);

  return {
    type: 'impression',
    timestamp: fns.currentTimestamp(),
    uuid: fns.uuid(),

    user: {
      id: userId,
      attributes: buildVisitorAttributes(configObj, userAttributes),
    },

    context: {
      accountId: configObj.accountId,
      projectId: configObj.projectId,
      revision: configObj.revision,
      clientName: clientEngine,
      clientVersion: clientVersion,
      anonymizeIP: configObj.anonymizeIP || false,
      botFiltering: configObj.botFiltering,
    },

    layer: {
      id: layerId,
    },

    experiment: {
      id: experimentId,
      key: experimentKey,
    },

    variation: {
      id: variationId,
      key: variationKey,
    },
  };
};

/**
 * Creates a ConversionEvent object from track
 * @param {Object} config
 * @param {Object} config.configObj
 * @param {String} config.eventKey
 * @param {Object|undefined} config.eventTags
 * @param {String} config.userId
 * @param {Object} config.userAttributes
 * @param {String} config.clientEngine
 * @param {String} config.clientVersion
 * @return {Object} a ConversionEvent object
 */
exports.buildConversionEvent = function buildConversionEvent(config) {
  var configObj = config.configObj;
  var userId = config.userId;
  var userAttributes = config.userAttributes;
  var clientEngine = config.clientEngine;
  var clientVersion = config.clientVersion;

  var eventKey = config.eventKey;
  var eventTags = config.eventTags;
  var eventId = projectConfig.getEventId(configObj, eventKey);

  return {
    type: 'conversion',
    timestamp: fns.currentTimestamp(),
    uuid: fns.uuid(),

    user: {
      id: userId,
      attributes: buildVisitorAttributes(configObj, userAttributes),
    },

    context: {
      accountId: configObj.accountId,
      projectId: configObj.projectId,
      revision: configObj.revision,
      clientName: clientEngine,
      clientVersion: clientVersion,
      anonymizeIP: configObj.anonymizeIP || false,
      botFiltering: configObj.botFiltering,
    },

    event: {
      id: eventId,
      key: eventKey,
    },

    revenue: eventTagUtils.getRevenueValue(eventTags, logger),
    value: eventTagUtils.getEventValue(eventTags, logger),
    tags: eventTags,
  };
};

function buildVisitorAttributes(configObj, attributes) {
  var builtAttributes = [];
  // Omit attribute values that are not supported by the log endpoint.
  fns.forOwn(attributes, function(attributeValue, attributeKey) {
    if (attributesValidator.isAttributeValid(attributeKey, attributeValue)) {
      var attributeId = projectConfig.getAttributeId(configObj, attributeKey, logger);
      if (attributeId) {
        builtAttributes.push({
          entityId: attributeId,
          key: attributeKey,
          value: attributes[attributeKey],
        });
      }
    }
  });

  return builtAttributes;
}

},{"../../utils/attributes_validator":44,"../../utils/event_tag_utils":48,"../../utils/fns":50,"../project_config":36,"@optimizely/js-sdk-logging":22}],33:[function(require,module,exports){
/**
 * Copyright 2016-2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var enums = require('../../utils/enums');
var fns = require('../../utils/fns');
var eventTagUtils = require('../../utils/event_tag_utils');
var projectConfig = require('../project_config');
var attributeValidator = require('../../utils/attributes_validator');

var ACTIVATE_EVENT_KEY = 'campaign_activated';
var CUSTOM_ATTRIBUTE_FEATURE_TYPE = 'custom';
var ENDPOINT = 'https://logx.optimizely.com/v1/events';
var HTTP_VERB = 'POST';

/**
 * Get params which are used same in both conversion and impression events
 * @param  {Object} options.attributes    Object representing user attributes and values which need to be recorded
 * @param  {string} options.clientEngine  The client we are using: node or javascript
 * @param  {string} options.clientVersion The version of the client
 * @param  {Object} options.configObj     Object representing project configuration, including datafile information and mappings for quick lookup
 * @param  {string} options.userId        ID for user
 * @param  {Object} options.Logger        logger
 * @return {Object}                       Common params with properties that are used in both conversion and impression events
 */
function getCommonEventParams(options) {
  var attributes = options.attributes;
  var configObj = options.configObj;
  var anonymize_ip = configObj.anonymizeIP;
  var botFiltering = configObj.botFiltering;
  if (anonymize_ip === null || anonymize_ip === undefined) {
    anonymize_ip = false;
  }

  var visitor = {
    snapshots: [],
    visitor_id: options.userId,
    attributes: []
  };

  var commonParams = {
    account_id: configObj.accountId,
    project_id: configObj.projectId,
    visitors: [visitor],
    revision: configObj.revision,
    client_name: options.clientEngine,
    client_version: options.clientVersion,
    anonymize_ip: anonymize_ip,
    enrich_decisions: true,
  };

  // Omit attribute values that are not supported by the log endpoint.
  fns.forOwn(attributes, function(attributeValue, attributeKey) {
    if (attributeValidator.isAttributeValid(attributeKey, attributeValue)) {
      var attributeId = projectConfig.getAttributeId(options.configObj, attributeKey, options.logger);
      if (attributeId) {
        commonParams.visitors[0].attributes.push({
          entity_id: attributeId,
          key: attributeKey,
          type: CUSTOM_ATTRIBUTE_FEATURE_TYPE,
          value: attributes[attributeKey],
        });
      }
    }
  });

  if (typeof botFiltering === 'boolean') {
    commonParams.visitors[0].attributes.push({
      entity_id: enums.CONTROL_ATTRIBUTES.BOT_FILTERING,
      key: enums.CONTROL_ATTRIBUTES.BOT_FILTERING,
      type: CUSTOM_ATTRIBUTE_FEATURE_TYPE,
      value: botFiltering,
    });
  }
  return commonParams;
}

/**
 * Creates object of params specific to impression events
 * @param  {Object} configObj    Object representing project configuration
 * @param  {string} experimentId ID of experiment for which impression needs to be recorded
 * @param  {string} variationId  ID for variation which would be presented to user
 * @return {Object}              Impression event params
 */
function getImpressionEventParams(configObj, experimentId, variationId) {
  var impressionEventParams = {
      decisions: [{
        campaign_id: projectConfig.getLayerId(configObj, experimentId),
        experiment_id: experimentId,
        variation_id: variationId,
      }],
      events: [{
        entity_id: projectConfig.getLayerId(configObj, experimentId),
        timestamp: fns.currentTimestamp(),
        key: ACTIVATE_EVENT_KEY,
        uuid: fns.uuid(),
      }]

    };
  return impressionEventParams;
}

/**
 * Creates object of params specific to conversion events
 * @param  {Object} configObj                 Object representing project configuration
 * @param  {string} eventKey                  Event key representing the event which needs to be recorded
 * @param  {Object} eventTags                 Values associated with the event.
 * @param  {Object} logger                    Logger object
 * @return {Object}                           Conversion event params
 */
function getVisitorSnapshot(configObj, eventKey, eventTags, logger) {
  var snapshot = {
    events: []
  };

  var eventDict = {
    entity_id: projectConfig.getEventId(configObj, eventKey),
    timestamp: fns.currentTimestamp(),
    uuid: fns.uuid(),
    key: eventKey,
  };

  if (eventTags) {
    var revenue = eventTagUtils.getRevenueValue(eventTags, logger);
    if (revenue !== null) {
      eventDict[enums.RESERVED_EVENT_KEYWORDS.REVENUE] = revenue;
    }

    var eventValue = eventTagUtils.getEventValue(eventTags, logger);
    if (eventValue !== null) {
      eventDict[enums.RESERVED_EVENT_KEYWORDS.VALUE] = eventValue;
    }

    eventDict['tags'] = eventTags;
  }
  snapshot.events.push(eventDict);

  return snapshot;
}

module.exports = {
  /**
   * Create impression event params to be sent to the logging endpoint
   * @param  {Object} options               Object containing values needed to build impression event
   * @param  {Object} options.attributes    Object representing user attributes and values which need to be recorded
   * @param  {string} options.clientEngine  The client we are using: node or javascript
   * @param  {string} options.clientVersion The version of the client
   * @param  {Object} options.configObj     Object representing project configuration, including datafile information and mappings for quick lookup
   * @param  {string} options.experimentId  Experiment for which impression needs to be recorded
   * @param  {string} options.userId        ID for user
   * @param  {string} options.variationId   ID for variation which would be presented to user
   * @return {Object}                       Params to be used in impression event logging endpoint call
   */
  getImpressionEvent: function(options) {
    var impressionEvent = {
      httpVerb: HTTP_VERB
    };

    var commonParams = getCommonEventParams(options);
    impressionEvent.url = ENDPOINT;

    var impressionEventParams = getImpressionEventParams(options.configObj, options.experimentId, options.variationId);
    // combine Event params into visitor obj
    commonParams.visitors[0].snapshots.push(impressionEventParams);

    impressionEvent.params = commonParams;

    return impressionEvent;
  },

  /**
   * Create conversion event params to be sent to the logging endpoint
   * @param  {Object} options                           Object containing values needed to build conversion event
   * @param  {Object} options.attributes                Object representing user attributes and values which need to be recorded
   * @param  {string} options.clientEngine              The client we are using: node or javascript
   * @param  {string} options.clientVersion             The version of the client
   * @param  {Object} options.configObj                 Object representing project configuration, including datafile information and mappings for quick lookup
   * @param  {string} options.eventKey                  Event key representing the event which needs to be recorded
   * @param  {Object} options.eventTags                 Object with event-specific tags
   * @param  {Object} options.logger                    Logger object
   * @param  {string} options.userId                    ID for user
   * @return {Object}                                   Params to be used in conversion event logging endpoint call
   */
  getConversionEvent: function(options) {
    var conversionEvent = {
      httpVerb: HTTP_VERB,
    };

    var commonParams = getCommonEventParams(options);
    conversionEvent.url = ENDPOINT;

    var snapshot = getVisitorSnapshot(options.configObj,
                                            options.eventKey,
                                            options.eventTags,
                                            options.logger);

    commonParams.visitors[0].snapshots = [snapshot];
    conversionEvent.params = commonParams;

    return conversionEvent;
  },
};

},{"../../utils/attributes_validator":44,"../../utils/enums":46,"../../utils/event_tag_utils":48,"../../utils/fns":50,"../project_config":36}],34:[function(require,module,exports){
/**
 * Copyright 2017, 2019 Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var enums = require('../../utils/enums');
var fns = require('../../utils/fns');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var LOG_LEVEL = enums.LOG_LEVEL;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var MODULE_NAME = 'NOTIFICATION_CENTER';

/**
 * NotificationCenter allows registration and triggering of callback functions using
 * notification event types defined in NOTIFICATION_TYPES of utils/enums/index.js:
 * - ACTIVATE: An impression event will be sent to Optimizely.
 * - TRACK a conversion event will be sent to Optimizely
 * @constructor
 * @param {Object} options
 * @param {Object} options.logger An instance of a logger to log messages with
 * @param {object} options.errorHandler An instance of errorHandler to handle any unexpected error
 * @returns {Object}
 */
function NotificationCenter(options) {
  this.logger = options.logger;
  this.errorHandler = options.errorHandler;
  this.__notificationListeners = {};
  fns.forOwn(enums.NOTIFICATION_TYPES, function(notificationTypeEnum) {
    this.__notificationListeners[notificationTypeEnum] = [];
  }.bind(this));
  this.__listenerId = 1;
}

/**
 * Add a notification callback to the notification center
 * @param {string} notificationType One of the values from NOTIFICATION_TYPES in utils/enums/index.js
 * @param {Function} callback Function that will be called when the event is triggered
 * @returns {number} If the callback was successfully added, returns a listener ID which can be used
 * to remove the callback by calling removeNotificationListener. The ID is a number greater than 0.
 * If there was an error and the listener was not added, addNotificationListener returns -1. This
 * can happen if the first argument is not a valid notification type, or if the same callback
 * function was already added as a listener by a prior call to this function.
 */
NotificationCenter.prototype.addNotificationListener = function (notificationType, callback) {
  try {
    var isNotificationTypeValid = fns.values(enums.NOTIFICATION_TYPES)
      .indexOf(notificationType) > -1;
    if (!isNotificationTypeValid) {
      return -1;
    }

    if (!this.__notificationListeners[notificationType]) {
      this.__notificationListeners[notificationType] = [];
    }

    var callbackAlreadyAdded = false;
    fns.forEach(this.__notificationListeners[notificationType], function (listenerEntry) {
      if (listenerEntry.callback === callback) {
        callbackAlreadyAdded = true;
        return false;
      }
    });
    if (callbackAlreadyAdded) {
      return -1;
    }

    this.__notificationListeners[notificationType].push({
      id: this.__listenerId,
      callback: callback,
    });

    var returnId = this.__listenerId;
    this.__listenerId += 1;
    return returnId;
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return -1;
  }
};

/**
 * Remove a previously added notification callback
 * @param {number} listenerId ID of listener to be removed
 * @returns {boolean} Returns true if the listener was found and removed, and false
 * otherwise.
 */
NotificationCenter.prototype.removeNotificationListener = function (listenerId) {
  try {
    var indexToRemove;
    var typeToRemove;
    fns.forOwn(this.__notificationListeners, function (listenersForType, notificationType) {
      fns.forEach(listenersForType, function (listenerEntry, i) {
        if (listenerEntry.id === listenerId) {
          indexToRemove = i;
          typeToRemove = notificationType;
          return false;
        }
      });
      if (indexToRemove !== undefined && typeToRemove !== undefined) {
        return false;
      }
    });

    if (indexToRemove !== undefined && typeToRemove !== undefined) {
      this.__notificationListeners[typeToRemove].splice(indexToRemove, 1);
      return true;
    }
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
  }
  return false;
};

/**
 * Removes all previously added notification listeners, for all notification types
 */
NotificationCenter.prototype.clearAllNotificationListeners = function () {
  try{
    fns.forOwn(enums.NOTIFICATION_TYPES, function (notificationTypeEnum) {
      this.__notificationListeners[notificationTypeEnum] = [];
    }.bind(this));
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
  }
};

/**
 * Remove all previously added notification listeners for the argument type
 * @param {string} notificationType One of enums.NOTIFICATION_TYPES
 */
NotificationCenter.prototype.clearNotificationListeners = function (notificationType) {
  try {
    this.__notificationListeners[notificationType] = [];
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
  }
};

/**
 * Fires notifications for the argument type. All registered callbacks for this type will be
 * called. The notificationData object will be passed on to callbacks called.
 * @param {string} notificationType One of enums.NOTIFICATION_TYPES
 * @param {Object} notificationData Will be passed to callbacks called
 */
NotificationCenter.prototype.sendNotifications = function (notificationType, notificationData) {
  try {
    fns.forEach(this.__notificationListeners[notificationType], function (listenerEntry) {
      var callback = listenerEntry.callback;
      try {
        callback(notificationData);
      } catch (ex) {
        this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.NOTIFICATION_LISTENER_EXCEPTION, MODULE_NAME, notificationType, ex.message));
      }
    }.bind(this));
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
  }
};

module.exports = {
  /**
   * Create an instance of NotificationCenter
   * @param {Object} options
   * @param {Object} options.logger An instance of a logger to log messages with
   * @returns {Object} An instance of NotificationCenter
   */
  createNotificationCenter: function(options) {
    return new NotificationCenter(options);
  },
};

},{"../../utils/enums":46,"../../utils/fns":50,"@optimizely/js-sdk-utils":26}],35:[function(require,module,exports){
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var projectConfig = require('../project_config');

// Get Experiment Ids which are part of rollouts
function getRolloutExperimentIds(rollouts) {
  return (rollouts || []).reduce(function(experimentIds, rollout) {
    rollout.experiments.forEach(function(e) {
      experimentIds[e.id] = true;
    });
    return experimentIds;
  }, {});
}

// Gets Map of all experiments except rollouts
function getExperimentsMap(configObj) {
  var rolloutExperimentIds = getRolloutExperimentIds(configObj.rollouts);
  var featureVariablesMap = (configObj.featureFlags || []).reduce(function(resultMap, feature){
    resultMap[feature.id] = feature.variables;
    return resultMap;
  }, {});
  return (configObj.experiments || []).reduce(function(experiments, experiment) {
    // skip experiments that are part of a rollout
    if (!rolloutExperimentIds[experiment.id]) {
      experiments[experiment.key] = {
        id: experiment.id,
        key: experiment.key,
        variationsMap: (experiment.variations || []).reduce(function(variations, variation) {
          variations[variation.key] = {
            id: variation.id,
            key: variation.key,
            variablesMap: getMergedVariablesMap(configObj, variation, experiment.id, featureVariablesMap)
          };
          if (projectConfig.isFeatureExperiment(configObj, experiment.id)) {
            variations[variation.key].featureEnabled = variation.featureEnabled;
          }
          return variations;
        }, {}),
      };
    }
    return experiments;
  }, {});
}

// Merges feature key and type from feature variables to variation variables.
function getMergedVariablesMap(configObj, variation, experimentId, featureVariablesMap) {
  var featureId = configObj.experimentFeatureMap[experimentId];
  var variablesObject = {};
  if (featureId) {
    var experimentFeatureVariables = featureVariablesMap[featureId];
    // Temporary variation variables map to get values to merge.
    var tempVariablesIdMap = (variation.variables || []).reduce(function(variablesMap, variable) {
      variablesMap[variable.id] = {
        id: variable.id,
        value: variable.value,
      };
      return variablesMap;
    }, {});
    variablesObject = (experimentFeatureVariables || []).reduce(function(variablesMap, featureVariable) {
      var variationVariable = tempVariablesIdMap[featureVariable.id];
      var variableValue = variation.featureEnabled && variationVariable ? variationVariable.value : featureVariable.defaultValue;
      variablesMap[featureVariable.key] = {
        id: featureVariable.id,
        key: featureVariable.key,
        type: featureVariable.type,
        value: variableValue,
      };
      return variablesMap;
    }, {});
  }
  return variablesObject;
}

// Gets map of all experiments
function getFeaturesMap(configObj, allExperiments) {
  return (configObj.featureFlags || []).reduce(function(features, feature) {
    features[feature.key] = {
      id: feature.id,
      key: feature.key,
      experimentsMap: (feature.experimentIds || []).reduce(function(experiments, experimentId) {
        var experimentKey = configObj.experimentIdMap[experimentId].key;
        experiments[experimentKey] = allExperiments[experimentKey];
        return experiments;
      }, {}),
      variablesMap: (feature.variables || []).reduce(function(variables, variable) {
        variables[variable.key] = {
          id: variable.id,
          key: variable.key,
          type: variable.type,
          value: variable.defaultValue,
        };
        return variables;
      }, {}),
    };
    return features;
  }, {});
}

module.exports = {
  getOptimizelyConfig: function(configObj) {
    // Fetch all feature variables from feature flags to merge them with variation variables
    var experimentsMap = getExperimentsMap(configObj);
    return {
      experimentsMap: experimentsMap,
      featuresMap: getFeaturesMap(configObj, experimentsMap),
      revision: configObj.revision,
    };
  },
};

},{"../project_config":36}],36:[function(require,module,exports){
/**
 * Copyright 2016-2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var fns = require('../../utils/fns');
var enums = require('../../utils/enums');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;
var configValidator = require('../../utils/config_validator');
var projectConfigSchema = require('./project_config_schema');

var EXPERIMENT_RUNNING_STATUS = 'Running';
var RESERVED_ATTRIBUTE_PREFIX = '$opt_';
var MODULE_NAME = 'PROJECT_CONFIG';

var ERROR_MESSAGES = enums.ERROR_MESSAGES;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var LOG_LEVEL = enums.LOG_LEVEL;
var FEATURE_VARIABLE_TYPES = enums.FEATURE_VARIABLE_TYPES;

module.exports = {
  /**
   * Creates projectConfig object to be used for quick project property lookup
   * @param  {Object} datafile JSON datafile representing the project
   * @return {Object} Object representing project configuration
   */
  createProjectConfig: function(datafile) {
    var projectConfig = fns.cloneDeep(datafile);

    /*
     * Conditions of audiences in projectConfig.typedAudiences are not
     * expected to be string-encoded as they are here in projectConfig.audiences.
     */
    fns.forEach(projectConfig.audiences, function(audience) {
      audience.conditions = JSON.parse(audience.conditions);
    });
    projectConfig.audiencesById = fns.keyBy(projectConfig.audiences, 'id');
    fns.assign(projectConfig.audiencesById, fns.keyBy(projectConfig.typedAudiences, 'id'));

    projectConfig.attributeKeyMap = fns.keyBy(projectConfig.attributes, 'key');
    projectConfig.eventKeyMap = fns.keyBy(projectConfig.events, 'key');
    projectConfig.groupIdMap = fns.keyBy(projectConfig.groups, 'id');

    var experiments;
    fns.forEach(projectConfig.groupIdMap, function(group, Id) {
      experiments = fns.cloneDeep(group.experiments);
      fns.forEach(experiments, function(experiment) {
        projectConfig.experiments.push(fns.assignIn(experiment, {groupId: Id}));
      });
    });

    projectConfig.rolloutIdMap = fns.keyBy(projectConfig.rollouts || [], 'id');
    fns.forOwn(projectConfig.rolloutIdMap, function(rollout) {
      fns.forEach(rollout.experiments || [], function(experiment) {
        projectConfig.experiments.push(fns.cloneDeep(experiment));
        // Creates { <variationKey>: <variation> } map inside of the experiment
        experiment.variationKeyMap = fns.keyBy(experiment.variations, 'key');
      });
    });

    projectConfig.experimentKeyMap = fns.keyBy(projectConfig.experiments, 'key');
    projectConfig.experimentIdMap = fns.keyBy(projectConfig.experiments, 'id');

    projectConfig.variationIdMap = {};
    projectConfig.variationVariableUsageMap = {};
    fns.forEach(projectConfig.experiments, function(experiment) {
      // Creates { <variationKey>: <variation> } map inside of the experiment
      experiment.variationKeyMap = fns.keyBy(experiment.variations, 'key');

      // Creates { <variationId>: { key: <variationKey>, id: <variationId> } } mapping for quick lookup
      fns.assignIn(projectConfig.variationIdMap, fns.keyBy(experiment.variations, 'id'));

      fns.forOwn(experiment.variationKeyMap, function(variation) {
        if (variation.variables) {
          projectConfig.variationVariableUsageMap[variation.id] = fns.keyBy(variation.variables, 'id');
        }
      });
    });

    // Object containing experiment Ids that exist in any feature
    // for checking that experiment is a feature experiment or not.
    projectConfig.experimentFeatureMap = {};

    projectConfig.featureKeyMap = fns.keyBy(projectConfig.featureFlags || [], 'key');
    fns.forOwn(projectConfig.featureKeyMap, function(feature) {
      feature.variableKeyMap = fns.keyBy(feature.variables, 'key');
      fns.forEach(feature.experimentIds || [], function(experimentId) {
        // Add this experiment in experiment-feature map.
        if (projectConfig.experimentFeatureMap[experimentId]) {
          projectConfig.experimentFeatureMap[experimentId].push(feature.id);
        } else {
          projectConfig.experimentFeatureMap[experimentId] = [feature.id];
        }

        var experimentInFeature = projectConfig.experimentIdMap[experimentId];
        // Experiments in feature can only belong to one mutex group.
        if (experimentInFeature.groupId && !feature.groupId) {
          feature.groupId = experimentInFeature.groupId;
        }
      });
    });

    return projectConfig;
  },

  /**
   * Get experiment ID for the provided experiment key
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Experiment key for which ID is to be determined
   * @return {string} Experiment ID corresponding to the provided experiment key
   * @throws If experiment key is not in datafile
   */
  getExperimentId: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (fns.isEmpty(experiment)) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EXPERIMENT_KEY, MODULE_NAME, experimentKey));
    }
    return experiment.id;
  },

  /**
   * Get layer ID for the provided experiment key
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentId Experiment ID for which layer ID is to be determined
   * @return {string} Layer ID corresponding to the provided experiment key
   * @throws If experiment key is not in datafile
   */
  getLayerId: function(projectConfig, experimentId) {
    var experiment = projectConfig.experimentIdMap[experimentId];
    if (fns.isEmpty(experiment)) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EXPERIMENT_ID, MODULE_NAME, experimentId));
    }
    return experiment.layerId;
  },

  /**
   * Get attribute ID for the provided attribute key
   * @param  {Object}      projectConfig Object representing project configuration
   * @param  {string}      attributeKey  Attribute key for which ID is to be determined
   * @param  {Object}      logger
   * @return {string|null} Attribute ID corresponding to the provided attribute key. Attribute key if it is a reserved attribute.
   */
  getAttributeId: function(projectConfig, attributeKey, logger) {
    var attribute = projectConfig.attributeKeyMap[attributeKey];
    var hasReservedPrefix = attributeKey.indexOf(RESERVED_ATTRIBUTE_PREFIX) === 0;
    if (attribute) {
      if (hasReservedPrefix) {
        logger.log(LOG_LEVEL.WARN,
                   sprintf('Attribute %s unexpectedly has reserved prefix %s; using attribute ID instead of reserved attribute name.', attributeKey, RESERVED_ATTRIBUTE_PREFIX));
      }
      return attribute.id;
    } else if (hasReservedPrefix) {
      return attributeKey;
    }

    logger.log(LOG_LEVEL.DEBUG, sprintf(ERROR_MESSAGES.UNRECOGNIZED_ATTRIBUTE, MODULE_NAME, attributeKey));
    return null;
  },

  /**
   * Get event ID for the provided
   * @param  {Object}      projectConfig Object representing project configuration
   * @param  {string}      eventKey      Event key for which ID is to be determined
   * @return {string|null} Event ID corresponding to the provided event key
   */
  getEventId: function(projectConfig, eventKey) {
    var event = projectConfig.eventKeyMap[eventKey];
    if (event) {
      return event.id;
    }
    return null;
  },

  /**
   * Get experiment status for the provided experiment key
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Experiment key for which status is to be determined
   * @return {string} Experiment status corresponding to the provided experiment key
   * @throws If experiment key is not in datafile
   */
  getExperimentStatus: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (fns.isEmpty(experiment)) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EXPERIMENT_KEY, MODULE_NAME, experimentKey));
    }
    return experiment.status;
  },

  /**
   * Returns whether experiment has a status of 'Running'
   * @param  {Object}  projectConfig Object representing project configuration
   * @param  {string}  experimentKey Experiment key for which status is to be compared with 'Running'
   * @return {Boolean}               true if experiment status is set to 'Running', false otherwise
   */
  isActive: function(projectConfig, experimentKey) {
    return module.exports.getExperimentStatus(projectConfig, experimentKey) === EXPERIMENT_RUNNING_STATUS;
  },

  /**
   * Determine for given experiment if event is running, which determines whether should be dispatched or not
   */
  isRunning: function(projectConfig, experimentKey) {
    return module.exports.getExperimentStatus(projectConfig, experimentKey) === EXPERIMENT_RUNNING_STATUS;
  },

  /**
   * Get audience conditions for the experiment
   * @param  {Object}         projectConfig Object representing project configuration
   * @param  {string}         experimentKey Experiment key for which audience conditions are to be determined
   * @return {Array}          Audience conditions for the experiment - can be an array of audience IDs, or a
   *                          nested array of conditions
   *                          Examples: ["5", "6"], ["and", ["or", "1", "2"], "3"]
   * @throws If experiment key is not in datafile
   */
  getExperimentAudienceConditions: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (fns.isEmpty(experiment)) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EXPERIMENT_KEY, MODULE_NAME, experimentKey));
    }

    return experiment.audienceConditions || experiment.audienceIds;
  },

  /**
   * Get variation key given experiment key and variation ID
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} variationId   ID of the variation
   * @return {string} Variation key or null if the variation ID is not found
   */
  getVariationKeyFromId: function(projectConfig, variationId) {
    if (projectConfig.variationIdMap.hasOwnProperty(variationId)) {
      return projectConfig.variationIdMap[variationId].key;
    }
    return null;
  },

  /**
   * Get the variation ID given the experiment key and variation key
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Key of the experiment the variation belongs to
   * @param  {string} variationKey  The variation key
   * @return {string} the variation ID
   */
  getVariationIdFromExperimentAndVariationKey: function(projectConfig, experimentKey, variationKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (experiment.variationKeyMap.hasOwnProperty(variationKey)) {
      return experiment.variationKeyMap[variationKey].id;
    }
    return null;
  },

  /**
   * Get experiment from provided experiment key
   * @param  {Object} projectConfig  Object representing project configuration
   * @param  {string} experimentKey  Event key for which experiment IDs are to be retrieved
   * @return {Object} experiment
   * @throws If experiment key is not in datafile
   */
  getExperimentFromKey: function(projectConfig, experimentKey) {
    if (projectConfig.experimentKeyMap.hasOwnProperty(experimentKey)) {
      var experiment = projectConfig.experimentKeyMap[experimentKey];
      if (experiment) {
        return experiment;
      }
    }

    throw new Error(sprintf(ERROR_MESSAGES.EXPERIMENT_KEY_NOT_IN_DATAFILE, MODULE_NAME, experimentKey));
  },

  /**
   * Given an experiment key, returns the traffic allocation within that experiment
   * @param  {Object} projectConfig Object representing project configuration
   * @param  {string} experimentKey Key representing the experiment
   * @return {Array<Object>}        Traffic allocation for the experiment
   * @throws If experiment key is not in datafile
   */
  getTrafficAllocation: function(projectConfig, experimentKey) {
    var experiment = projectConfig.experimentKeyMap[experimentKey];
    if (fns.isEmpty(experiment)) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EXPERIMENT_KEY, MODULE_NAME, experimentKey));
    }
    return experiment.trafficAllocation;
  },

  /**
   * Get experiment from provided experiment id. Log an error if no experiment
   * exists in the project config with the given ID.
   * @param  {Object} projectConfig  Object representing project configuration
   * @param  {string} experimentId  ID of desired experiment object
   * @return {Object} Experiment object
   */
  getExperimentFromId: function(projectConfig, experimentId, logger) {
    if (projectConfig.experimentIdMap.hasOwnProperty(experimentId)) {
      var experiment = projectConfig.experimentIdMap[experimentId];
      if (experiment) {
        return experiment;
      }
    }

    logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.INVALID_EXPERIMENT_ID, MODULE_NAME, experimentId));
    return null;
  },

  /**
   * Get feature from provided feature key. Log an error if no feature exists in
   * the project config with the given key.
   * @param {Object} projectConfig
   * @param {string} featureKey
   * @param {Object} logger
   * @return {Object|null} Feature object, or null if no feature with the given
   * key exists
   */
  getFeatureFromKey: function(projectConfig, featureKey, logger) {
    if (projectConfig.featureKeyMap.hasOwnProperty(featureKey)) {
      var feature = projectConfig.featureKeyMap[featureKey];
      if (feature) {
        return feature;
      }
    }

    logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.FEATURE_NOT_IN_DATAFILE, MODULE_NAME, featureKey));
    return null;
  },

  /**
   * Get the variable with the given key associated with the feature with the
   * given key. If the feature key or the variable key are invalid, log an error
   * message.
   * @param {Object} projectConfig
   * @param {string} featureKey
   * @param {string} variableKey
   * @param {Object} logger
   * @return {Object|null} Variable object, or null one or both of the given
   * feature and variable keys are invalid
   */
  getVariableForFeature: function(projectConfig, featureKey, variableKey, logger) {
    var feature = projectConfig.featureKeyMap[featureKey];
    if (!feature) {
      logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.FEATURE_NOT_IN_DATAFILE, MODULE_NAME, featureKey));
      return null;
    }

    var variable = feature.variableKeyMap[variableKey];
    if (!variable) {
      logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.VARIABLE_KEY_NOT_IN_DATAFILE, MODULE_NAME, variableKey, featureKey));
      return null;
    }

    return variable;
  },

  /**
   * Get the value of the given variable for the given variation. If the given
   * variable has no value for the given variation, return null. Log an error message if the variation is invalid. If the
   * variable or variation are invalid, return null.
   * @param {Object} projectConfig
   * @param {Object} variable
   * @param {Object} variation
   * @param {Object} logger
   * @return {string|null} The value of the given variable for the given
   * variation, or null if the given variable has no value
   * for the given variation or if the variation or variable are invalid
   */
  getVariableValueForVariation: function(projectConfig, variable, variation, logger) {
    if (!variable || !variation) {
      return null;
    }

    if (!projectConfig.variationVariableUsageMap.hasOwnProperty(variation.id)) {
      logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.VARIATION_ID_NOT_IN_DATAFILE_NO_EXPERIMENT, MODULE_NAME, variation.id));
      return null;
    }

    var variableUsages = projectConfig.variationVariableUsageMap[variation.id];
    var variableUsage = variableUsages[variable.id];

    return variableUsage ? variableUsage.value : null;
  },

  /**
   * Given a variable value in string form, try to cast it to the argument type.
   * If the type cast succeeds, return the type casted value, otherwise log an
   * error and return null.
   * @param {string} variableValue  Variable value in string form
   * @param {string} variableType   Type of the variable whose value was passed
   *                                in the first argument. Must be one of
   *                                FEATURE_VARIABLE_TYPES in
   *                                lib/utils/enums/index.js. The return value's
   *                                type is determined by this argument (boolean
   *                                for BOOLEAN, number for INTEGER or DOUBLE,
   *                                and string for STRING).
   * @param {Object} logger         Logger instance
   * @returns {*}                   Variable value of the appropriate type, or
   *                                null if the type cast failed
   */
  getTypeCastValue: function(variableValue, variableType, logger) {
    var castValue;

    switch (variableType) {
      case FEATURE_VARIABLE_TYPES.BOOLEAN:
        if (variableValue !== 'true' && variableValue !== 'false') {
          logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.UNABLE_TO_CAST_VALUE, MODULE_NAME, variableValue, variableType));
          castValue = null;
        } else {
          castValue = variableValue === 'true';
        }
        break;

      case FEATURE_VARIABLE_TYPES.INTEGER:
        castValue = parseInt(variableValue, 10);
        if (isNaN(castValue)) {
          logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.UNABLE_TO_CAST_VALUE, MODULE_NAME, variableValue, variableType));
          castValue = null;
        }
        break;

      case FEATURE_VARIABLE_TYPES.DOUBLE:
        castValue = parseFloat(variableValue);
        if (isNaN(castValue)) {
          logger.log(LOG_LEVEL.ERROR, sprintf(ERROR_MESSAGES.UNABLE_TO_CAST_VALUE, MODULE_NAME, variableValue, variableType));
          castValue = null;
        }
        break;

      default: // type is STRING
        castValue = variableValue;
        break;
    }

    return castValue;
  },

  /**
   * Returns an object containing all audiences in the project config. Keys are audience IDs
   * and values are audience objects.
   * @param projectConfig
   * @returns {Object}
   */
  getAudiencesById: function(projectConfig) {
    return projectConfig.audiencesById;
  },

  /**
   * Returns true if an event with the given key exists in the datafile, and false otherwise
   * @param {Object} projectConfig
   * @param {string} eventKey
   * @returns {boolean}
   */
  eventWithKeyExists: function(projectConfig, eventKey) {
    return projectConfig.eventKeyMap.hasOwnProperty(eventKey);
  },

  /**
   *
   * @param {Object} projectConfig
   * @param {string} experimentId
   * @returns {boolean} Returns true if experiment belongs to
   * any feature, false otherwise.
   */
  isFeatureExperiment: function(projectConfig, experimentId) {
    return projectConfig.experimentFeatureMap.hasOwnProperty(experimentId);
  },

  /**
   * Try to create a project config object from the given datafile and
   * configuration properties.
   * If successful, return the project config object, otherwise throws an error
   * @param  {Object} config
   * @param  {Object} config.datafile
   * @param  {Object} config.jsonSchemaValidator
   * @param  {Object} config.logger
   * @param  {Object} config.skipJSONValidation
   * @return {Object} Project config object
   */
  tryCreatingProjectConfig: function(config) {
    configValidator.validateDatafile(config.datafile);
    if (config.skipJSONValidation === true) {
      config.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.SKIPPING_JSON_VALIDATION, MODULE_NAME));
    } else if (config.jsonSchemaValidator) {
      config.jsonSchemaValidator.validate(projectConfigSchema, config.datafile);
      config.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.VALID_DATAFILE, MODULE_NAME));
    }
    return module.exports.createProjectConfig(config.datafile);
  },
};

},{"../../utils/config_validator":45,"../../utils/enums":46,"../../utils/fns":50,"./project_config_schema":38,"@optimizely/js-sdk-utils":26}],37:[function(require,module,exports){
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fns = require('../../utils/fns');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;
var logging = require('@optimizely/js-sdk-logging');
var configValidator = require('../../utils/config_validator');
var datafileManager = require('@optimizely/js-sdk-datafile-manager');
var enums = require('../../utils/enums');
var projectConfig = require('../../core/project_config');
var optimizelyConfig = require('../optimizely_config');

var logger = logging.getLogger();

var ERROR_MESSAGES = enums.ERROR_MESSAGES;

var MODULE_NAME = 'PROJECT_CONFIG_MANAGER';

/**
 * Return an error message derived from a thrown value. If the thrown value is
 * an error, return the error's message property. Otherwise, return a default
 * provided by the second argument.
 * @param {*} maybeError
 * @param {String=} defaultMessage
 * @return {String}
 */
function getErrorMessage(maybeError, defaultMessage) {
  if (maybeError instanceof Error) {
    return maybeError.message;
  }
  return defaultMessage || 'Unknown error';
}

/**
 * ProjectConfigManager provides project config objects via its methods
 * getConfig and onUpdate. It uses a DatafileManager to fetch datafiles. It is
 * responsible for parsing and validating datafiles, and converting datafile
 * JSON objects into project config objects.
 * @param {Object}         config
 * @param {Object|string=} config.datafile
 * @param {Object=}        config.datafileOptions
 * @param {Object=}        config.jsonSchemaValidator
 * @param {string=}        config.sdkKey
 * @param {boolean=}       config.skipJSONValidation
 */
function ProjectConfigManager(config) {
  try {
    this.__initialize(config);
  } catch (ex) {
    logger.error(ex);
    this.__updateListeners = [];
    this.__configObj = null;
    this.__optimizelyConfigObj = null;
    this.__readyPromise = Promise.resolve({
      success: false,
      reason: getErrorMessage(ex, 'Error in initialize'),
    });
  }
}

/**
 * Initialize internal properties including __updateListeners, __configObj, and
 * __readyPromise, using the argument config. Create and subscribe to a datafile
 * manager if appropriate.
 * @param {Object}         config
 * @param {Object|string=} config.datafile
 * @param {Object=}        config.datafileOptions
 * @param {Object=}        config.jsonSchemaValidator
 * @param {string=}        config.sdkKey
 * @param {boolean=}       config.skipJSONValidation
 */
ProjectConfigManager.prototype.__initialize = function(config) {
  this.__updateListeners = [];
  this.jsonSchemaValidator = config.jsonSchemaValidator;
  this.skipJSONValidation = config.skipJSONValidation;

  if (!config.datafile && !config.sdkKey) {
    this.__configObj = null;
    var datafileAndSdkKeyMissingError = new Error(sprintf(ERROR_MESSAGES.DATAFILE_AND_SDK_KEY_MISSING, MODULE_NAME));
    this.__readyPromise = Promise.resolve({
      success: false,
      reason: getErrorMessage(datafileAndSdkKeyMissingError),
    });
    logger.error(datafileAndSdkKeyMissingError);
    return;
  }

  var initialDatafile = this.__getDatafileFromConfig(config);
  var projectConfigCreationEx;
  if (initialDatafile) {
    try {
      this.__configObj = projectConfig.tryCreatingProjectConfig({
        datafile: initialDatafile,
        jsonSchemaValidator: this.jsonSchemaValidator,
        logger: logger,
        skipJSONValidation: this.skipJSONValidation,
      });
      this.__optimizelyConfigObj = optimizelyConfig.getOptimizelyConfig(this.__configObj);
    } catch (ex) {
      logger.error(ex);
      projectConfigCreationEx = ex;
      this.__configObj = null;
    }
  } else {
    this.__configObj = null;
  }

  if (config.sdkKey) {
    var datafileManagerConfig = {
      sdkKey: config.sdkKey,
    };
    if (this.__validateDatafileOptions(config.datafileOptions)) {
      fns.assign(datafileManagerConfig, config.datafileOptions);
    }
    if (initialDatafile && this.__configObj) {
      datafileManagerConfig.datafile = initialDatafile;
    }
    this.datafileManager = new datafileManager.HttpPollingDatafileManager(datafileManagerConfig);
    this.datafileManager.start();
    this.__readyPromise = this.datafileManager.onReady().then(
      this.__onDatafileManagerReadyFulfill.bind(this),
      this.__onDatafileManagerReadyReject.bind(this)
    );
    this.datafileManager.on('update', this.__onDatafileManagerUpdate.bind(this));
  } else if (this.__configObj) {
    this.__readyPromise = Promise.resolve({
      success: true,
    });
  } else {
    this.__readyPromise = Promise.resolve({
      success: false,
      reason: getErrorMessage(projectConfigCreationEx, 'Invalid datafile'),
    });
  }
};

/**
 * Respond to datafile manager's onReady promise becoming fulfilled.
 * If there are validation or parse failures using the datafile provided by
 * DatafileManager, ProjectConfigManager's ready promise is resolved with an
 * unsuccessful result. Otherwise, ProjectConfigManager updates its own project
 * config object from the new datafile, and its ready promise is resolved with a
 * successful result.
 */
ProjectConfigManager.prototype.__onDatafileManagerReadyFulfill = function() {
  var newDatafile = this.datafileManager.get();
  var newConfigObj;
  try {
    newConfigObj = projectConfig.tryCreatingProjectConfig({
      datafile: newDatafile,
      jsonSchemaValidator: this.jsonSchemaValidator,
      logger: logger,
      skipJSONValidation: this.skipJSONValidation,
    });
  } catch (ex) {
    logger.error(ex);
    return {
      success: false,
      reason: getErrorMessage(ex),
    };
  }
  this.__handleNewConfigObj(newConfigObj);
  return {
    success: true,
  };
};

/**
 * Respond to datafile manager's onReady promise becoming rejected.
 * When DatafileManager's onReady promise is rejected, there is no possibility
 * of obtaining a datafile. In this case, ProjectConfigManager's ready promise
 * is fulfilled with an unsuccessful result.
 * @param {Error} err
 */
ProjectConfigManager.prototype.__onDatafileManagerReadyReject = function(err) {
  return {
    success: false,
    reason: getErrorMessage(err, 'Failed to become ready'),
  };
};

/**
 * Respond to datafile manager's update event. Attempt to update own config
 * object using latest datafile from datafile manager. Call own registered
 * update listeners if successful
 */
ProjectConfigManager.prototype.__onDatafileManagerUpdate = function() {
  var newDatafile = this.datafileManager.get();
  var newConfigObj;
  try {
    newConfigObj = projectConfig.tryCreatingProjectConfig({
      datafile: newDatafile,
      jsonSchemaValidator: this.jsonSchemaValidator,
      logger: logger,
      skipJSONValidation: this.skipJSONValidation,
    });
  } catch (ex) {
    logger.error(ex);
  }
  if (newConfigObj) {
    this.__handleNewConfigObj(newConfigObj);
  }
};

/**
 * If the argument config contains a valid datafile object or string,
 * return a datafile object based on that provided datafile, otherwise
 * return null.
 * @param {Object}         config
 * @param {Object|string=} config.datafile
 * @return {Object|null}
 */
ProjectConfigManager.prototype.__getDatafileFromConfig = function(config) {
  var initialDatafile = null;
  try {
    if (config.datafile) {
      configValidator.validateDatafile(config.datafile);
      if (typeof config.datafile === 'string' || config.datafile instanceof String) {
        initialDatafile = JSON.parse(config.datafile);
      } else {
        initialDatafile = config.datafile;
      }
    }
  } catch (ex) {
    logger.error(ex);
  }
  return initialDatafile;
};

/**
 * Validate user-provided datafileOptions. It should be an object or undefined.
 * @param {*} datafileOptions
 * @returns {boolean}
 */
ProjectConfigManager.prototype.__validateDatafileOptions = function(datafileOptions) {
  if (typeof datafileOptions === 'undefined') {
    return true;
  }

  if (typeof datafileOptions === 'object') {
    return datafileOptions !== null;
  }

  return false;
};

/**
 * Update internal project config object to be argument object when the argument
 * object has a different revision than the current internal project config
 * object. If the internal object is updated, call update listeners.
 * @param {Object} newConfigObj
 */
ProjectConfigManager.prototype.__handleNewConfigObj = function(newConfigObj) {
  var oldConfigObj = this.__configObj;

  var oldRevision = oldConfigObj ? oldConfigObj.revision : 'null';
  if (oldRevision === newConfigObj.revision) {
    return;
  }

  this.__configObj = newConfigObj;
  this.__optimizelyConfigObj = optimizelyConfig.getOptimizelyConfig(newConfigObj);

  this.__updateListeners.forEach(function(listener) {
    listener(newConfigObj);
  });
};

/**
 * Returns the current project config object, or null if no project config object
 * is available
 * @return {Object|null}
 */
ProjectConfigManager.prototype.getConfig = function() {
  return this.__configObj;
}

/**
 * Returns the optimizely config object
 * @return {Object}
 */
ProjectConfigManager.prototype.getOptimizelyConfig = function() {
  return this.__optimizelyConfigObj;
};

/**
 * Returns a Promise that fulfills when this ProjectConfigManager is ready to
 * use (meaning it has a valid project config object), or has failed to become
 * ready.
 *
 * Failure can be caused by the following:
 * - At least one of sdkKey or datafile is not provided in the constructor argument
 * - The provided datafile was invalid
 * - The datafile provided by the datafile manager was invalid
 * - The datafile manager failed to fetch a datafile
 *
 * The returned Promise is fulfilled with a result object containing these
 * properties:
 *    - success (boolean): True if this instance is ready to use with a valid
 *                         project config object, or false if it failed to
 *                         become ready
 *    - reason (string=):  If success is false, this is a string property with
 *                         an explanatory message.
 * @return {Promise}
 */
ProjectConfigManager.prototype.onReady = function() {
  return this.__readyPromise;
};

/**
 * Add a listener for project config updates. The listener will be called
 * whenever this instance has a new project config object available.
 * Returns a dispose function that removes the subscription
 * @param {Function} listener
 * @return {Function}
 */
ProjectConfigManager.prototype.onUpdate = function(listener) {
  this.__updateListeners.push(listener);
  return function() {
    var index = this.__updateListeners.indexOf(listener);
    if (index > -1) {
      this.__updateListeners.splice(index, 1);
    }
  }.bind(this);
};

/**
 * Stop the internal datafile manager and remove all update listeners
 */
ProjectConfigManager.prototype.stop = function() {
  if (this.datafileManager) {
    this.datafileManager.stop();
  }
  this.__updateListeners = [];
};

module.exports = {
  ProjectConfigManager: ProjectConfigManager,
};

},{"../../core/project_config":36,"../../utils/config_validator":45,"../../utils/enums":46,"../../utils/fns":50,"../optimizely_config":35,"@optimizely/js-sdk-datafile-manager":10,"@optimizely/js-sdk-logging":22,"@optimizely/js-sdk-utils":26}],38:[function(require,module,exports){
/**
 * Copyright 2016-2017, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*eslint-disable */
/**
 * Project Config JSON Schema file used to validate the project json datafile
 */
module.exports = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "projectId": {
      "type": "string",
      "required": true
    },
    "accountId": {
      "type": "string",
      "required": true
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "required": true
          },
          "policy": {
            "type": "string",
            "required": true
          },
          "trafficAllocation": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "entityId": {
                  "type": "string",
                  "required": true
                },
                "endOfRange": {
                  "type": "integer",
                  "required": true
                }
              }
            },
            "required": true
          },
          "experiments": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "required": true
                },
                "key": {
                  "type": "string",
                  "required": true
                },
                "status": {
                  "type": "string",
                  "required": true
                },
                "layerId": {
                  "type": "string",
                  "required": true
                },
                "variations": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true
                      },
                      "key": {
                        "type": "string",
                        "required": true
                      }
                    }
                  },
                  "required": true
                },
                "trafficAllocation": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "entityId": {
                        "type": "string",
                        "required": true
                      },
                      "endOfRange": {
                        "type": "integer",
                        "required": true
                      }
                    }
                  },
                  "required": true
                },
                "audienceIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true
                },
                "forcedVariations": {
                  "type": "object",
                  "required": true
                }
              }
            },
            "required": true
          }
        }
      },
      "required": true
    },
    "experiments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "required": true
          },
          "key": {
            "type": "string",
            "required": true
          },
          "status": {
            "type": "string",
            "required": true
          },
          "layerId": {
            "type": "string",
            "required": true
          },
          "variations": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "required": true
                },
                "key": {
                  "type": "string",
                  "required": true
                }
              }
            },
            "required": true
          },
          "trafficAllocation": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "entityId": {
                  "type": "string",
                  "required": true
                },
                "endOfRange": {
                  "type": "integer",
                  "required": true
                }
              }
            },
            "required": true
          },
          "audienceIds": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "required": true
          },
          "forcedVariations": {
            "type": "object",
            "required": true
          }
        }
      },
      "required": true
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string",
            "required": true
          },
          "experimentIds": {
            "type": "array",
            "items": {
              "type": "string",
              "required": true
            }
          },
          "id": {
            "type": "string",
            "required": true
          }
        }
      },
      "required": true
    },
    "audiences": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "required": true
          },
          "name": {
            "type": "string",
            "required": true
          },
          "conditions": {
            "type": "string",
            "required": true
          }
        }
      },
      "required": true
    },
    "attributes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "required": true
          },
          "key": {
            "type": "string",
            "required": true
          },
        }
      },
      "required": true
    },
    "version": {
      "type": "string",
      "required": true
    },
    "revision": {
      "type": "string",
      "required": true
    },
  }
};

},{}],39:[function(require,module,exports){
/**
 * Copyright 2016-2017, 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
require('promise-polyfill/dist/polyfill');
var logging = require('@optimizely/js-sdk-logging');
var fns = require('./utils/fns');
var configValidator = require('./utils/config_validator');
var defaultErrorHandler = require('./plugins/error_handler');
var defaultEventDispatcher = require('./plugins/event_dispatcher/index.browser');
var enums = require('./utils/enums');
var eventProcessor = require('@optimizely/js-sdk-event-processor');
var loggerPlugin = require('./plugins/logger');
var Optimizely = require('./optimizely');
var eventProcessorConfigValidator = require('./utils/event_processor_config_validator');

var logger = logging.getLogger();
logging.setLogHandler(loggerPlugin.createLogger());
logging.setLogLevel(logging.LogLevel.INFO);

var MODULE_NAME = 'INDEX_BROWSER';

var DEFAULT_EVENT_BATCH_SIZE = 10;
var DEFAULT_EVENT_FLUSH_INTERVAL = 1000; // Unit is ms, default is 1s

var hasRetriedEvents = false;
/**
 * Entry point into the Optimizely Browser SDK
 */
module.exports = {
  logging: loggerPlugin,
  errorHandler: defaultErrorHandler,
  eventDispatcher: defaultEventDispatcher,
  enums: enums,

  setLogger: logging.setLogHandler,
  setLogLevel: logging.setLogLevel,

  /**
   * Creates an instance of the Optimizely class
   * @param  {Object} config
   * @param  {Object} config.datafile
   * @param  {Object} config.errorHandler
   * @param  {Object} config.eventDispatcher
   * @param  {Object} config.logger
   * @param  {Object} config.logLevel
   * @param  {Object} config.userProfileService
   * @param {Object} config.eventBatchSize
   * @param {Object} config.eventFlushInterval
   * @return {Object} the Optimizely object
   */
  createInstance: function(config) {
    try {
      config = config || {};

      // TODO warn about setting per instance errorHandler / logger / logLevel
      if (config.errorHandler) {
        logging.setErrorHandler(config.errorHandler);
      }
      if (config.logger) {
        logging.setLogHandler(config.logger);
        // respect the logger's shouldLog functionality
        logging.setLogLevel(logging.LogLevel.NOTSET);
      }
      if (config.logLevel !== undefined) {
        logging.setLogLevel(config.logLevel);
      }

      try {
        configValidator.validate(config);
        config.isValidInstance = true;
      } catch (ex) {
        logger.error(ex);
        config.isValidInstance = false;
      }

      // Explicitly check for null or undefined
      // prettier-ignore
      if (config.skipJSONValidation == null) { // eslint-disable-line eqeqeq
        config.skipJSONValidation = true;
      }

      var eventDispatcher;
      // prettier-ignore
      if (config.eventDispatcher == null) { // eslint-disable-line eqeqeq
        // only wrap the event dispatcher with pending events retry if the user didnt override
        eventDispatcher = new eventProcessor.LocalStoragePendingEventsDispatcher({
          eventDispatcher: defaultEventDispatcher,
        });

        if (!hasRetriedEvents) {
          eventDispatcher.sendPendingEvents();
          hasRetriedEvents = true;
        }
      } else {
        eventDispatcher = config.eventDispatcher;
      }

      config = fns.assignIn(
        {
          clientEngine: enums.JAVASCRIPT_CLIENT_ENGINE,
          eventBatchSize: DEFAULT_EVENT_BATCH_SIZE,
          eventFlushInterval: DEFAULT_EVENT_FLUSH_INTERVAL,
        },
        config,
        {
          eventDispatcher: eventDispatcher,
          // always get the OptimizelyLogger facade from logging
          logger: logger,
          errorHandler: logging.getErrorHandler(),
        }
      );

      if (!eventProcessorConfigValidator.validateEventBatchSize(config.eventBatchSize)) {
        logger.warn('Invalid eventBatchSize %s, defaulting to %s', config.eventBatchSize, DEFAULT_EVENT_BATCH_SIZE);
        config.eventBatchSize = DEFAULT_EVENT_BATCH_SIZE;
      }
      if (!eventProcessorConfigValidator.validateEventFlushInterval(config.eventFlushInterval)) {
        logger.warn('Invalid eventFlushInterval %s, defaulting to %s', config.eventFlushInterval, DEFAULT_EVENT_FLUSH_INTERVAL);
        config.eventFlushInterval = DEFAULT_EVENT_FLUSH_INTERVAL;
      }

      var optimizely = new Optimizely(config);

      try {
        if (typeof window.addEventListener === 'function') {
          var unloadEvent = 'onpagehide' in window ? 'pagehide' : 'unload';
          window.addEventListener(
            unloadEvent,
            function() {
              optimizely.close();
            },
            false
          );
        }
      } catch (e) {
        logger.error(enums.LOG_MESSAGES.UNABLE_TO_ATTACH_UNLOAD, MODULE_NAME, e.message);
      }

      return optimizely;
    } catch (e) {
      logger.error(e);
      return null;
    }
  },

  __internalResetRetryState: function() {
    hasRetriedEvents = false;
  },
};

},{"./optimizely":40,"./plugins/error_handler":41,"./plugins/event_dispatcher/index.browser":42,"./plugins/logger":43,"./utils/config_validator":45,"./utils/enums":46,"./utils/event_processor_config_validator":47,"./utils/fns":50,"@optimizely/js-sdk-event-processor":16,"@optimizely/js-sdk-logging":22,"promise-polyfill/dist/polyfill":233}],40:[function(require,module,exports){
/****************************************************************************
 * Copyright 2016-2019, Optimizely, Inc. and contributors                   *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

var fns = require('../utils/fns');
var attributesValidator = require('../utils/attributes_validator');
var decisionService = require('../core/decision_service');
var enums = require('../utils/enums');
var eventBuilder = require('../core/event_builder/index.js');
var eventHelpers = require('../core/event_builder/event_helpers');
var eventProcessor = require('@optimizely/js-sdk-event-processor');
var eventTagsValidator = require('../utils/event_tags_validator');
var notificationCenter = require('../core/notification_center');
var projectConfig = require('../core/project_config');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;
var userProfileServiceValidator = require('../utils/user_profile_service_validator');
var stringValidator = require('../utils/string_value_validator');
var projectConfigManager = require('../core/project_config/project_config_manager');

var ERROR_MESSAGES = enums.ERROR_MESSAGES;
var LOG_LEVEL = enums.LOG_LEVEL;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var MODULE_NAME = 'OPTIMIZELY';
var DECISION_SOURCES = enums.DECISION_SOURCES;
var FEATURE_VARIABLE_TYPES = enums.FEATURE_VARIABLE_TYPES;
var DECISION_NOTIFICATION_TYPES = enums.DECISION_NOTIFICATION_TYPES;
var NOTIFICATION_TYPES = enums.NOTIFICATION_TYPES;

var DEFAULT_ONREADY_TIMEOUT = 30000;

/**
 * The Optimizely class
 * @param {Object} config
 * @param {string} config.clientEngine
 * @param {string} config.clientVersion
 * @param {Object} config.datafile
 * @param {Object} config.errorHandler
 * @param {Object} config.eventDispatcher
 * @param {Object} config.logger
 * @param {Object} config.skipJSONValidation
 * @param {Object} config.userProfileService
 * @param {Object} config.eventBatchSize
 * @param {Object} config.eventFlushInterval
 */
function Optimizely(config) {
  var clientEngine = config.clientEngine;
  if (enums.VALID_CLIENT_ENGINES.indexOf(clientEngine) === -1) {
    config.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.INVALID_CLIENT_ENGINE, MODULE_NAME, clientEngine));
    clientEngine = enums.NODE_CLIENT_ENGINE;
  }

  this.clientEngine = clientEngine;
  this.clientVersion = config.clientVersion || enums.NODE_CLIENT_VERSION;
  this.errorHandler = config.errorHandler;
  this.eventDispatcher = config.eventDispatcher;
  this.__isOptimizelyConfigValid = config.isValidInstance;
  this.logger = config.logger;

  this.projectConfigManager = new projectConfigManager.ProjectConfigManager({
    datafile: config.datafile,
    datafileOptions: config.datafileOptions,
    jsonSchemaValidator: config.jsonSchemaValidator,
    sdkKey: config.sdkKey,
    skipJSONValidation: config.skipJSONValidation,
  });

  this.__disposeOnUpdate = this.projectConfigManager.onUpdate(function(configObj) {
    this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.UPDATED_OPTIMIZELY_CONFIG, MODULE_NAME, configObj.revision, configObj.projectId));
    this.notificationCenter.sendNotifications(NOTIFICATION_TYPES.OPTIMIZELY_CONFIG_UPDATE);
  }.bind(this));

  this.__readyPromise = this.projectConfigManager.onReady();

  var userProfileService = null;
  if (config.userProfileService) {
    try {
      if (userProfileServiceValidator.validate(config.userProfileService)) {
        userProfileService = config.userProfileService;
        this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.VALID_USER_PROFILE_SERVICE, MODULE_NAME));
      }
    } catch (ex) {
      this.logger.log(LOG_LEVEL.WARNING, ex.message);
    }
  }

  this.decisionService = decisionService.createDecisionService({
    userProfileService: userProfileService,
    logger: this.logger,
    UNSTABLE_conditionEvaluators: config.UNSTABLE_conditionEvaluators
  });

  this.notificationCenter = notificationCenter.createNotificationCenter({
    logger: this.logger,
    errorHandler: this.errorHandler,
  });

  this.eventProcessor = new eventProcessor.LogTierV1EventProcessor({
    dispatcher: this.eventDispatcher,
    flushInterval: config.eventFlushInterval,
    maxQueueSize: config.eventBatchSize,
    notificationCenter: this.notificationCenter,
  });
  this.eventProcessor.start();

  this.__readyTimeouts = {};
  this.__nextReadyTimeoutId = 0;
}

/**
 * Returns a truthy value if this instance currently has a valid project config
 * object, and the initial configuration object that was passed into the
 * constructor was also valid.
 * @return {*}
 */
Optimizely.prototype.__isValidInstance = function() {
  return this.__isOptimizelyConfigValid && this.projectConfigManager.getConfig();
};

/**
 * Buckets visitor and sends impression event to Optimizely.
 * @param  {string}      experimentKey
 * @param  {string}      userId
 * @param  {Object}      attributes
 * @return {string|null} variation key
 */
Optimizely.prototype.activate = function(experimentKey, userId, attributes) {
  try {
    if (!this.__isValidInstance()) {
      this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.INVALID_OBJECT, MODULE_NAME, 'activate'));
      return null;
    }

    if (!this.__validateInputs({ experiment_key: experimentKey, user_id: userId }, attributes)) {
      return this.__notActivatingExperiment(experimentKey, userId);
    }

    var configObj = this.projectConfigManager.getConfig();
    if (!configObj) {
      return null;
    }

    try {
      var variationKey = this.getVariation(experimentKey, userId, attributes);
      if (variationKey === null) {
        return this.__notActivatingExperiment(experimentKey, userId);
      }

      // If experiment is not set to 'Running' status, log accordingly and return variation key
      if (!projectConfig.isRunning(configObj, experimentKey)) {
        var shouldNotDispatchActivateLogMessage = sprintf(
          LOG_MESSAGES.SHOULD_NOT_DISPATCH_ACTIVATE,
          MODULE_NAME,
          experimentKey
        );
        this.logger.log(LOG_LEVEL.DEBUG, shouldNotDispatchActivateLogMessage);
        return variationKey;
      }

      this._sendImpressionEvent(experimentKey, variationKey, userId, attributes);

      return variationKey;
    } catch (ex) {
      this.logger.log(LOG_LEVEL.ERROR, ex.message);
      var failedActivationLogMessage = sprintf(LOG_MESSAGES.NOT_ACTIVATING_USER, MODULE_NAME, userId, experimentKey);
      this.logger.log(LOG_LEVEL.INFO, failedActivationLogMessage);
      this.errorHandler.handleError(ex);
      return null;
    }
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
};

/**
 * Create an impression event and call the event dispatcher's dispatch method to
 * send this event to Optimizely. Then use the notification center to trigger
 * any notification listeners for the ACTIVATE notification type.
 * @param {string} experimentKey  Key of experiment that was activated
 * @param {string} variationKey   Key of variation shown in experiment that was activated
 * @param {string} userId         ID of user to whom the variation was shown
 * @param {Object} attributes     Optional user attributes
 */
Optimizely.prototype._sendImpressionEvent = function(experimentKey, variationKey, userId, attributes) {
  var configObj = this.projectConfigManager.getConfig();
  if (!configObj) {
    return;
  }

  var impressionEvent = eventHelpers.buildImpressionEvent({
    experimentKey: experimentKey,
    variationKey: variationKey,
    userId: userId,
    userAttributes: attributes,
    clientEngine: this.clientEngine,
    clientVersion: this.clientVersion,
    configObj: configObj,
  });
  // TODO is it okay to not pass a projectConfig as second argument
  this.eventProcessor.process(impressionEvent);
  this.__emitNotificationCenterActivate(experimentKey, variationKey, userId, attributes);
};

/**
 * Emit the ACTIVATE notification on the notificationCenter
 * @param {string} experimentKey  Key of experiment that was activated
 * @param {string} variationKey   Key of variation shown in experiment that was activated
 * @param {string} userId         ID of user to whom the variation was shown
 * @param {Object} attributes     Optional user attributes
 */
Optimizely.prototype.__emitNotificationCenterActivate = function(experimentKey, variationKey, userId, attributes) {
  var configObj = this.projectConfigManager.getConfig();
  if (!configObj) {
    return;
  }

  var variationId = projectConfig.getVariationIdFromExperimentAndVariationKey(
    configObj,
    experimentKey,
    variationKey
  );
  var experimentId = projectConfig.getExperimentId(configObj, experimentKey);
  var impressionEventOptions = {
    attributes: attributes,
    clientEngine: this.clientEngine,
    clientVersion: this.clientVersion,
    configObj: configObj,
    experimentId: experimentId,
    userId: userId,
    variationId: variationId,
    logger: this.logger,
  };
  var impressionEvent = eventBuilder.getImpressionEvent(impressionEventOptions);
  var experiment = configObj.experimentKeyMap[experimentKey];
  var variation;
  if (experiment && experiment.variationKeyMap) {
    variation = experiment.variationKeyMap[variationKey];
  }
  this.notificationCenter.sendNotifications(
    NOTIFICATION_TYPES.ACTIVATE,
    {
      experiment: experiment,
      userId: userId,
      attributes: attributes,
      variation: variation,
      logEvent: impressionEvent
    }
  );
};

/**
 * Sends conversion event to Optimizely.
 * @param  {string} eventKey
 * @param  {string} userId
 * @param  {string} attributes
 * @param  {Object} eventTags Values associated with the event.
 */
Optimizely.prototype.track = function(eventKey, userId, attributes, eventTags) {
  try {
    if (!this.__isValidInstance()) {
      this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.INVALID_OBJECT, MODULE_NAME, 'track'));
      return;
    }

    if (!this.__validateInputs({ user_id: userId, event_key: eventKey }, attributes, eventTags)) {
      return;
    }

    var configObj = this.projectConfigManager.getConfig();
    if (!configObj) {
      return;
    }

    if (!projectConfig.eventWithKeyExists(configObj, eventKey)) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EVENT_KEY, MODULE_NAME, eventKey));
    }

    // remove null values from eventTags
    eventTags = this.__filterEmptyValues(eventTags);
    var conversionEvent = eventHelpers.buildConversionEvent({
      eventKey: eventKey,
      eventTags: eventTags,
      userId: userId,
      userAttributes: attributes,
      clientEngine: this.clientEngine,
      clientVersion: this.clientVersion,
      configObj: configObj,
    });
    this.logger.log(LOG_LEVEL.INFO, sprintf(enums.LOG_MESSAGES.TRACK_EVENT, MODULE_NAME, eventKey, userId));
    // TODO is it okay to not pass a projectConfig as second argument
    this.eventProcessor.process(conversionEvent);
    this.__emitNotificationCenterTrack(eventKey, userId, attributes, eventTags);
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    var failedTrackLogMessage = sprintf(LOG_MESSAGES.NOT_TRACKING_USER, MODULE_NAME, userId);
    this.logger.log(LOG_LEVEL.INFO, failedTrackLogMessage);
  }
};

/**
 * Send TRACK event to notificationCenter
 * @param  {string} eventKey
 * @param  {string} userId
 * @param  {string} attributes
 * @param  {Object} eventTags Values associated with the event.
 */
Optimizely.prototype.__emitNotificationCenterTrack = function(eventKey, userId, attributes, eventTags) {
  try {
    var configObj = this.projectConfigManager.getConfig();
    if (!configObj) {
      return;
    }

    var conversionEventOptions = {
      attributes: attributes,
      clientEngine: this.clientEngine,
      clientVersion: this.clientVersion,
      configObj: configObj,
      eventKey: eventKey,
      eventTags: eventTags,
      logger: this.logger,
      userId: userId,
    };
    var conversionEvent = eventBuilder.getConversionEvent(conversionEventOptions);

    this.notificationCenter.sendNotifications(NOTIFICATION_TYPES.TRACK, {
      eventKey: eventKey,
      userId: userId,
      attributes: attributes,
      eventTags: eventTags,
      logEvent: conversionEvent,
    });
  } catch (ex) {
    this.logger.log(LOG_LEVEL.ERROR, ex.message);
    this.errorHandler.handleError(ex);
  }
};

/**
 * Gets variation where visitor will be bucketed.
 * @param  {string}      experimentKey
 * @param  {string}      userId
 * @param  {Object}      attributes
 * @return {string|null} variation key
 */
Optimizely.prototype.getVariation = function(experimentKey, userId, attributes) {
  try {
    if (!this.__isValidInstance()) {
      this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.INVALID_OBJECT, MODULE_NAME, 'getVariation'));
      return null;
    }

    try {
      if (!this.__validateInputs({ experiment_key: experimentKey, user_id: userId }, attributes)) {
        return null;
      }

      var configObj = this.projectConfigManager.getConfig();
      if (!configObj) {
        return null;
      }

      var experiment = configObj.experimentKeyMap[experimentKey];
      if (fns.isEmpty(experiment)) {
        this.logger.log(LOG_LEVEL.DEBUG, sprintf(ERROR_MESSAGES.INVALID_EXPERIMENT_KEY, MODULE_NAME, experimentKey));
        return null;
      }

      var variationKey = this.decisionService.getVariation(configObj, experimentKey, userId, attributes);
      var decisionNotificationType = projectConfig.isFeatureExperiment(configObj, experiment.id) ? DECISION_NOTIFICATION_TYPES.FEATURE_TEST :
        DECISION_NOTIFICATION_TYPES.AB_TEST;

      this.notificationCenter.sendNotifications(
        NOTIFICATION_TYPES.DECISION,
        {
          type: decisionNotificationType,
          userId: userId,
          attributes: attributes || {},
          decisionInfo: {
            experimentKey: experimentKey,
            variationKey: variationKey,
          }
        }
      );

      return variationKey;
    } catch (ex) {
      this.logger.log(LOG_LEVEL.ERROR, ex.message);
      this.errorHandler.handleError(ex);
      return null;
    }
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
};

/**
 * Force a user into a variation for a given experiment.
 * @param {string} experimentKey
 * @param {string} userId
 * @param {string|null} variationKey user will be forced into. If null, then clear the existing experiment-to-variation mapping.
 * @return boolean A boolean value that indicates if the set completed successfully.
 */
Optimizely.prototype.setForcedVariation = function(experimentKey, userId, variationKey) {
  if (!this.__validateInputs({ experiment_key: experimentKey, user_id: userId })) {
    return false;
  }

  var configObj = this.projectConfigManager.getConfig();
  if (!configObj) {
    return false;
  }

  try {
    return this.decisionService.setForcedVariation(configObj, experimentKey, userId, variationKey);
  } catch (ex) {
    this.logger.log(LOG_LEVEL.ERROR, ex.message);
    this.errorHandler.handleError(ex);
    return false;
  }
};

/**
 * Gets the forced variation for a given user and experiment.
 * @param  {string} experimentKey
 * @param  {string} userId
 * @return {string|null} The forced variation key.
 */
Optimizely.prototype.getForcedVariation = function(experimentKey, userId) {
  if (!this.__validateInputs({ experiment_key: experimentKey, user_id: userId })) {
    return null;
  }

  var configObj = this.projectConfigManager.getConfig();
  if (!configObj) {
    return null;
  }

  try {
    return this.decisionService.getForcedVariation(configObj, experimentKey, userId);
  } catch (ex) {
    this.logger.log(LOG_LEVEL.ERROR, ex.message);
    this.errorHandler.handleError(ex);
    return null;
  }
};

/**
 * Validate string inputs, user attributes and event tags.
 * @param  {string}  stringInputs   Map of string keys and associated values
 * @param  {Object}  userAttributes Optional parameter for user's attributes
 * @param  {Object}  eventTags      Optional parameter for event tags
 * @return {boolean} True if inputs are valid
 *
 */
Optimizely.prototype.__validateInputs = function(stringInputs, userAttributes, eventTags) {
  try {
    // Null, undefined or non-string user Id is invalid.
    if (stringInputs.hasOwnProperty('user_id')) {
      var userId = stringInputs.user_id;
      if (typeof userId !== 'string' || userId === null || userId === 'undefined') {
        throw new Error(sprintf(ERROR_MESSAGES.INVALID_INPUT_FORMAT, MODULE_NAME, 'user_id'));
      }

      delete stringInputs.user_id;
    }

    var inputKeys = Object.keys(stringInputs);
    for (var index = 0; index < inputKeys.length; index++) {
      var key = inputKeys[index];
      if (!stringValidator.validate(stringInputs[key])) {
        throw new Error(sprintf(ERROR_MESSAGES.INVALID_INPUT_FORMAT, MODULE_NAME, key));
      }
    }
    if (userAttributes) {
      attributesValidator.validate(userAttributes);
    }
    if (eventTags) {
      eventTagsValidator.validate(eventTags);
    }
    return true;
  } catch (ex) {
    this.logger.log(LOG_LEVEL.ERROR, ex.message);
    this.errorHandler.handleError(ex);
    return false;
  }
};

/**
 * Shows failed activation log message and returns null when user is not activated in experiment
 * @param  experimentKey
 * @param  userId
 * @return {null}
 */
Optimizely.prototype.__notActivatingExperiment = function(experimentKey, userId) {
  var failedActivationLogMessage = sprintf(LOG_MESSAGES.NOT_ACTIVATING_USER, MODULE_NAME, userId, experimentKey);
  this.logger.log(LOG_LEVEL.INFO, failedActivationLogMessage);
  return null;
};

/**
 * Filters out attributes/eventTags with null or undefined values
 * @param  map
 * @returns {Object} map
 */
Optimizely.prototype.__filterEmptyValues = function(map) {
  for (var key in map) {
    if (map.hasOwnProperty(key) && (map[key] === null || map[key] === undefined)) {
      delete map[key];
    }
  }
  return map;
};

/**
 * Returns true if the feature is enabled for the given user.
 * @param {string} featureKey   Key of feature which will be checked
 * @param {string} userId       ID of user which will be checked
 * @param {Object} attributes   Optional user attributes
 * @return {boolean}            True if the feature is enabled for the user, false otherwise
 */
Optimizely.prototype.isFeatureEnabled = function(featureKey, userId, attributes) {
  try {
    if (!this.__isValidInstance()) {
      this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.INVALID_OBJECT, MODULE_NAME, 'isFeatureEnabled'));
      return false;
    }

    if (!this.__validateInputs({ feature_key: featureKey, user_id: userId }, attributes)) {
      return false;
    }

    var configObj = this.projectConfigManager.getConfig();
    if (!configObj) {
      return false;
    }

    var feature = projectConfig.getFeatureFromKey(configObj, featureKey, this.logger);
    if (!feature) {
      return false;
    }

    var featureEnabled = false;
    var decision = this.decisionService.getVariationForFeature(configObj, feature, userId, attributes);
    var variation = decision.variation;
    var sourceInfo = {};

    if (variation) {
      featureEnabled = variation.featureEnabled;
      if (decision.decisionSource === DECISION_SOURCES.FEATURE_TEST) {
        sourceInfo = {
          experimentKey: decision.experiment.key,
          variationKey: decision.variation.key,
        }
        // got a variation from the exp, so we track the impression
        this._sendImpressionEvent(decision.experiment.key, decision.variation.key, userId, attributes);
      }
    }

    if (featureEnabled === true) {
      this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.FEATURE_ENABLED_FOR_USER, MODULE_NAME, featureKey, userId));
    } else {
      this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.FEATURE_NOT_ENABLED_FOR_USER, MODULE_NAME, featureKey, userId));
      featureEnabled = false;
    }

    var featureInfo = {
      featureKey: featureKey,
      featureEnabled: featureEnabled,
      source: decision.decisionSource,
      sourceInfo: sourceInfo
    };

    this.notificationCenter.sendNotifications(
      NOTIFICATION_TYPES.DECISION,
      {
        type: DECISION_NOTIFICATION_TYPES.FEATURE,
        userId: userId,
        attributes: attributes || {},
        decisionInfo: featureInfo,
      }
    );

    return featureEnabled;
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return false;
  }
};

/**
 * Returns an Array containing the keys of all features in the project that are
 * enabled for the given user.
 * @param {string} userId
 * @param {Object} attributes
 * @return {Array} Array of feature keys (strings)
 */
Optimizely.prototype.getEnabledFeatures = function(userId, attributes) {
  try {
    var enabledFeatures = [];
    if (!this.__isValidInstance()) {
      this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.INVALID_OBJECT, MODULE_NAME, 'getEnabledFeatures'));
      return enabledFeatures;
    }

    if (!this.__validateInputs({ user_id: userId })) {
      return enabledFeatures;
    }

    var configObj = this.projectConfigManager.getConfig();
    if (!configObj) {
      return enabledFeatures;
    }

    fns.forOwn(
      configObj.featureKeyMap,
      function(feature) {
        if (this.isFeatureEnabled(feature.key, userId, attributes)) {
          enabledFeatures.push(feature.key);
        }
      }.bind(this)
    );

    return enabledFeatures;
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return [];
  }
};

/**
 * Returns dynamically-typed value of the variable attached to the given
 * feature flag. Returns null if the feature key or variable key is invalid.
 *
 * @param {string} featureKey           Key of the feature whose variable's
 *                                      value is being accessed
 * @param {string} variableKey          Key of the variable whose value is
 *                                      being accessed
 * @param {string} userId               ID for the user
 * @param {Object} attributes           Optional user attributes
 * @return {string|boolean|number|null} Value of the variable cast to the appropriate
 *                                      type, or null if the feature key is invalid or
 *                                      the variable key is invalid
 */

Optimizely.prototype.getFeatureVariable = function(featureKey, variableKey, userId, attributes) {
  try {
    return this._getFeatureVariableForType(featureKey, variableKey, null, userId, attributes);
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
};

/**
 * Helper method to get the value for a variable of a certain type attached to a
 * feature flag. Returns null if the feature key is invalid, the variable key is
 * invalid, the given variable type does not match the variable's actual type,
 * or the variable value cannot be cast to the required type. If the given variable
 * type is null, the value of the variable cast to the appropriate type is returned.
 *
 * @param {string} featureKey           Key of the feature whose variable's value is
 *                                      being accessed
 * @param {string} variableKey          Key of the variable whose value is being
 *                                      accessed
 * @param {string|null} variableType    Type of the variable whose value is being
 *                                      accessed (must be one of FEATURE_VARIABLE_TYPES
 *                                      in lib/utils/enums/index.js), or null to return the
 *                                      value of the variable cast to the appropriate type
 * @param {string} userId               ID for the user
 * @param {Object} attributes           Optional user attributes
 * @return {string|boolean|number|null} Value of the variable cast to the appropriate
 *                                      type, or null if the feature key is invalid, the
 *                                      variable key is invalid, or there is a mismatch
 *                                      with the type of the variable
 */
Optimizely.prototype._getFeatureVariableForType = function(featureKey, variableKey, variableType, userId, attributes) {
  if (!this.__isValidInstance()) {
    var apiName = (variableType) ? 'getFeatureVariable' + variableType.charAt(0).toUpperCase() + variableType.slice(1) : 'getFeatureVariable';
    this.logger.log(LOG_LEVEL.ERROR, sprintf(LOG_MESSAGES.INVALID_OBJECT, MODULE_NAME, apiName));
    return null;
  }

  if (!this.__validateInputs({ feature_key: featureKey, variable_key: variableKey, user_id: userId }, attributes)) {
    return null;
  }

  var configObj = this.projectConfigManager.getConfig();
  if (!configObj) {
    return null;
  }

  var featureFlag = projectConfig.getFeatureFromKey(configObj, featureKey, this.logger);
  if (!featureFlag) {
    return null;
  }

  var variable = projectConfig.getVariableForFeature(configObj, featureKey, variableKey, this.logger);
  if (!variable) {
    return null;
  }

  if (!variableType) {
    variableType = variable.type;
  } else if (variable.type !== variableType) {
    this.logger.log(
      LOG_LEVEL.WARNING,
      sprintf(LOG_MESSAGES.VARIABLE_REQUESTED_WITH_WRONG_TYPE, MODULE_NAME, variableType, variable.type)
    );
    return null;
  }

  var featureEnabled = false;
  var variableValue = variable.defaultValue;
  var decision = this.decisionService.getVariationForFeature(configObj, featureFlag, userId, attributes);

  if (decision.variation !== null) {
    featureEnabled = decision.variation.featureEnabled;
    var value = projectConfig.getVariableValueForVariation(configObj, variable, decision.variation, this.logger);
    if (value !== null) {
      if (featureEnabled === true) {
        variableValue = value;
        this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.USER_RECEIVED_VARIABLE_VALUE, MODULE_NAME, variableKey, featureFlag.key, variableValue, userId));
      } else {
        this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.FEATURE_NOT_ENABLED_RETURN_DEFAULT_VARIABLE_VALUE, MODULE_NAME,
          featureFlag.key, userId, variableKey));
      }
    } else {
      this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.VARIABLE_NOT_USED_RETURN_DEFAULT_VARIABLE_VALUE, MODULE_NAME, variableKey, decision.variation.key));
    }
  } else {
    this.logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.USER_RECEIVED_DEFAULT_VARIABLE_VALUE, MODULE_NAME, userId,
      variableKey, featureFlag.key));
  }

  var sourceInfo = {};
  if (decision.decisionSource === DECISION_SOURCES.FEATURE_TEST) {
    sourceInfo = {
      experimentKey: decision.experiment.key,
      variationKey: decision.variation.key,
    }
  }

  var typeCastedValue = projectConfig.getTypeCastValue(variableValue, variableType, this.logger);
  this.notificationCenter.sendNotifications(
    NOTIFICATION_TYPES.DECISION,
    {
      type: DECISION_NOTIFICATION_TYPES.FEATURE_VARIABLE,
      userId: userId,
      attributes: attributes || {},
      decisionInfo: {
        featureKey: featureKey,
        featureEnabled: featureEnabled,
        source: decision.decisionSource,
        variableKey: variableKey,
        variableValue: typeCastedValue,
        variableType: variableType,
        sourceInfo: sourceInfo,
      }
    }
  );
  return typeCastedValue;
};

/**
 * Returns value for the given boolean variable attached to the given feature
 * flag.
 * @param {string} featureKey   Key of the feature whose variable's value is
 *                              being accessed
 * @param {string} variableKey  Key of the variable whose value is being
 *                              accessed
 * @param {string} userId       ID for the user
 * @param {Object} attributes   Optional user attributes
 * @return {boolean|null}       Boolean value of the variable, or null if the
 *                              feature key is invalid, the variable key is
 *                              invalid, or there is a mismatch with the type
 *                              of the variable
 */
Optimizely.prototype.getFeatureVariableBoolean = function(featureKey, variableKey, userId, attributes) {
  try {
    return this._getFeatureVariableForType(featureKey, variableKey, FEATURE_VARIABLE_TYPES.BOOLEAN, userId, attributes);
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
};

/**
 * Returns value for the given double variable attached to the given feature
 * flag.
 * @param {string} featureKey   Key of the feature whose variable's value is
 *                              being accessed
 * @param {string} variableKey  Key of the variable whose value is being
 *                              accessed
 * @param {string} userId       ID for the user
 * @param {Object} attributes   Optional user attributes
 * @return {number|null}        Number value of the variable, or null if the
 *                              feature key is invalid, the variable key is
 *                              invalid, or there is a mismatch with the type
 *                              of the variable
 */
Optimizely.prototype.getFeatureVariableDouble = function(featureKey, variableKey, userId, attributes) {
  try {
    return this._getFeatureVariableForType(featureKey, variableKey, FEATURE_VARIABLE_TYPES.DOUBLE, userId, attributes);
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
};

/**
 * Returns value for the given integer variable attached to the given feature
 * flag.
 * @param {string} featureKey   Key of the feature whose variable's value is
 *                              being accessed
 * @param {string} variableKey  Key of the variable whose value is being
 *                              accessed
 * @param {string} userId       ID for the user
 * @param {Object} attributes   Optional user attributes
 * @return {number|null}        Number value of the variable, or null if the
 *                              feature key is invalid, the variable key is
 *                              invalid, or there is a mismatch with the type
 *                              of the variable
 */
Optimizely.prototype.getFeatureVariableInteger = function(featureKey, variableKey, userId, attributes) {
  try {
    return this._getFeatureVariableForType(featureKey, variableKey, FEATURE_VARIABLE_TYPES.INTEGER, userId, attributes);
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
};

/**
 * Returns value for the given string variable attached to the given feature
 * flag.
 * @param {string} featureKey   Key of the feature whose variable's value is
 *                              being accessed
 * @param {string} variableKey  Key of the variable whose value is being
 *                              accessed
 * @param {string} userId       ID for the user
 * @param {Object} attributes   Optional user attributes
 * @return {string|null}        String value of the variable, or null if the
 *                              feature key is invalid, the variable key is
 *                              invalid, or there is a mismatch with the type
 *                              of the variable
 */
Optimizely.prototype.getFeatureVariableString = function(featureKey, variableKey, userId, attributes) {
  try {
    return this._getFeatureVariableForType(featureKey, variableKey, FEATURE_VARIABLE_TYPES.STRING, userId, attributes);
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
};

/**
 * Returns OptimizelyConfig object containing experiments and features data
 * @return {Object}
 *
 * OptimizelyConfig Object Schema
 * {
 *   'experimentsMap': {
 *     'my-fist-experiment': {
 *       'id': '111111',
 *       'key': 'my-fist-experiment'
 *       'variationsMap': {
 *         'variation_1': {
 *           'id': '121212',
 *           'key': 'variation_1',
 *           'variablesMap': {
 *             'age': {
 *               'id': '222222',
 *               'key': 'age',
 *               'type': 'integer',
 *               'value': '0',
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   'featuresMap': {
 *     'awesome-feature': {
 *       'id': '333333',
 *       'key': 'awesome-feature',
 *       'experimentsMap': Object,
 *       'variationsMap': Object,
 *     }
 *   }
 * }
 */
Optimizely.prototype.getOptimizelyConfig = function() {
  try {
    var configObj = this.projectConfigManager.getConfig();
    if (!configObj) {
      return null;
    }
    return this.projectConfigManager.getOptimizelyConfig();
  } catch (e) {
    this.logger.log(LOG_LEVEL.ERROR, e.message);
    this.errorHandler.handleError(e);
    return null;
  }
}

/**
 * Stop background processes belonging to this instance, including:
 *
 * - Active datafile requests
 * - Pending datafile requests
 * - Pending event queue flushes
 *
 * In-flight datafile requests will be aborted. Any events waiting to be sent
 * as part of a batched event request will be immediately batched and sent to
 * the event dispatcher.
 *
 * If any such requests were sent to the event dispatcher, returns a Promise
 * that fulfills after the event dispatcher calls the response callback for each
 * request. Otherwise, returns an immediately-fulfilled Promise.
 *
 * Returned Promises are fulfilled with result objects containing these
 * properties:
 *    - success (boolean): true if all events in the queue at the time close was
 *                         called were combined into requests, sent to the
 *                         event dispatcher, and the event dispatcher called the
 *                         callbacks for each request. false if an unexpected
 *                         error was encountered during the close process.
 *    - reason (string=):  If success is false, this is a string property with
 *                         an explanatory message.
 *
 * NOTE: After close is called, this instance is no longer usable - any events
 * generated will no longer be sent to the event dispatcher.
 *
 * @return {Promise}
 */
Optimizely.prototype.close = function() {
  try {
    var eventProcessorStoppedPromise = this.eventProcessor.stop();
    if (this.__disposeOnUpdate) {
      this.__disposeOnUpdate();
      this.__disposeOnUpdate = null;
    }
    if (this.projectConfigManager) {
      this.projectConfigManager.stop();
    }
    Object.keys(this.__readyTimeouts).forEach(function(readyTimeoutId) {
      var readyTimeoutRecord = this.__readyTimeouts[readyTimeoutId];
      clearTimeout(readyTimeoutRecord.readyTimeout);
      readyTimeoutRecord.onClose();
    }.bind(this));
    this.__readyTimeouts = {};
    return eventProcessorStoppedPromise.then(
      function() {
        return {
          success: true,
        };
      },
      function(err) {
        return {
          success: false,
          reason: String(err),
        };
      }
    );
  } catch (err) {
    this.logger.log(LOG_LEVEL.ERROR, err.message);
    this.errorHandler.handleError(err);
    return Promise.resolve({
      success: false,
      reason: String(err),
    });
  }
};

/**
 * Returns a Promise that fulfills when this instance is ready to use (meaning
 * it has a valid datafile), or has failed to become ready within a period of
 * time (configurable by the timeout property of the options argument), or when
 * this instance is closed via the close method.
 *
 * If a valid datafile was provided in the constructor, the returned Promise is
 * immediately fulfilled. If an sdkKey was provided, a manager will be used to
 * fetch  a datafile, and the returned promise will fulfill if that fetch
 * succeeds or fails before the timeout. The default timeout is 30 seconds,
 * which will be used if no timeout is provided in the argument options object.
 *
 * The returned Promise is fulfilled with a result object containing these
 * properties:
 *    - success (boolean): True if this instance is ready to use with a valid
 *                         datafile, or false if this instance failed to become
 *                         ready or was closed prior to becoming ready.
 *    - reason (string=):  If success is false, this is a string property with
 *                         an explanatory message. Failure could be due to
 *                         expiration of the timeout, network errors,
 *                         unsuccessful responses, datafile parse errors,
 *                         datafile validation errors, or the instance being
 *                         closed
 * @param  {Object=}          options
 * @param  {number|undefined} options.timeout
 * @return {Promise}
 */
Optimizely.prototype.onReady = function(options) {
  var timeout;
  if (typeof options === 'object' && options !== null) {
    timeout = options.timeout;
  }
  if (!fns.isFinite(timeout)) {
    timeout = DEFAULT_ONREADY_TIMEOUT;
  }

  var resolveTimeoutPromise;
  var timeoutPromise = new Promise(function(resolve) {
    resolveTimeoutPromise = resolve;
  });

  var timeoutId = this.__nextReadyTimeoutId;
  this.__nextReadyTimeoutId++;

  var onReadyTimeout = function() {
    delete this.__readyTimeouts[timeoutId];
    resolveTimeoutPromise({
      success: false,
      reason: sprintf('onReady timeout expired after %s ms', timeout),
    });
  }.bind(this);
  var readyTimeout = setTimeout(onReadyTimeout, timeout);
  var onClose = function() {
    resolveTimeoutPromise({
      success: false,
      reason: 'Instance closed',
    });
  };

  this.__readyTimeouts[timeoutId] = {
    readyTimeout: readyTimeout,
    onClose: onClose,
  };

  this.__readyPromise.then(function() {
    clearTimeout(readyTimeout);
    delete this.__readyTimeouts[timeoutId];
    resolveTimeoutPromise({
      success: true,
    });
  }.bind(this));

  return Promise.race([this.__readyPromise, timeoutPromise]);
};

module.exports = Optimizely;

},{"../core/decision_service":31,"../core/event_builder/event_helpers":32,"../core/event_builder/index.js":33,"../core/notification_center":34,"../core/project_config":36,"../core/project_config/project_config_manager":37,"../utils/attributes_validator":44,"../utils/enums":46,"../utils/event_tags_validator":49,"../utils/fns":50,"../utils/string_value_validator":51,"../utils/user_profile_service_validator":52,"@optimizely/js-sdk-event-processor":16,"@optimizely/js-sdk-utils":26}],41:[function(require,module,exports){
/**
 * Copyright 2016, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Default error handler implementation
 */
module.exports = {
  /**
   * Handle given exception
   * @param  {Object} exception An exception object
   */
  handleError: function() {
    // no-op
  }
};

},{}],42:[function(require,module,exports){
/**
 * Copyright 2016-2017, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var fns = require('../../utils/fns');

var POST_METHOD = 'POST';
var GET_METHOD = 'GET';
var READYSTATE_COMPLETE = 4;

module.exports = {
  /**
   * Sample event dispatcher implementation for tracking impression and conversions
   * Users of the SDK can provide their own implementation
   * @param  {Object} eventObj
   * @param  {Function} callback
   */
  dispatchEvent: function(eventObj, callback) {
    var url = eventObj.url;
    var params = eventObj.params;
    var req;
    if (eventObj.httpVerb === POST_METHOD) {
      req = new XMLHttpRequest();
      req.open(POST_METHOD, url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.onreadystatechange = function() {
        if (req.readyState === READYSTATE_COMPLETE && callback && typeof callback === 'function') {
          try {
            callback(params);
          } catch (e) {
            // TODO: Log this somehow (consider adding a logger to the EventDispatcher interface)
          }
        }
      };
      req.send(JSON.stringify(params));
    } else {
      // add param for cors headers to be sent by the log endpoint
      url += '?wxhr=true';
      if (params) {
        url += '&' + toQueryString(params);
      }

      req = new XMLHttpRequest();
      req.open(GET_METHOD, url, true);
      req.onreadystatechange = function() {
        if (req.readyState === READYSTATE_COMPLETE && callback && typeof callback === 'function') {
          try {
            callback();
          } catch (e) {
            // TODO: Log this somehow (consider adding a logger to the EventDispatcher interface)
          }
        }
      };
      req.send();
    }
  },
};

var toQueryString = function(obj) {
  return fns.map(obj, function(v, k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(v);
  }).join('&');
};

},{"../../utils/fns":50}],43:[function(require,module,exports){
/**
 * Copyright 2016-2017, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var logging = require('@optimizely/js-sdk-logging');

function NoOpLogger() {}

NoOpLogger.prototype.log = function() {};

module.exports = {
  createLogger: function(opts) {
    return new logging.ConsoleLogHandler(opts);
  },

  createNoOpLogger: function() {
    return new NoOpLogger();
  },
};

},{"@optimizely/js-sdk-logging":22}],44:[function(require,module,exports){
/**
 * Copyright 2016, 2018-2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides utility method for validating that the attributes user has provided are valid
 */

var sprintf = require('@optimizely/js-sdk-utils').sprintf;
var lodashForOwn = require('lodash/forOwn');
var fns = require('../../utils/fns');

var ERROR_MESSAGES = require('../enums').ERROR_MESSAGES;
var MODULE_NAME = 'ATTRIBUTES_VALIDATOR';

module.exports = {
  /**
   * Validates user's provided attributes
   * @param  {Object}  attributes
   * @return {boolean} True if the attributes are valid
   * @throws If the attributes are not valid
   */
  validate: function(attributes) {
    if (typeof attributes === 'object' && !Array.isArray(attributes) && attributes !== null) {
      lodashForOwn(attributes, function(value, key) {
        if (typeof value === 'undefined') {
          throw new Error(sprintf(ERROR_MESSAGES.UNDEFINED_ATTRIBUTE, MODULE_NAME, key));
        }
      });
      return true;
    } else {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_ATTRIBUTES, MODULE_NAME));
    }
  },

  isAttributeValid: function(attributeKey, attributeValue) {
    return (typeof attributeKey === 'string') &&
    (typeof attributeValue === 'string' || typeof attributeValue === 'boolean' || (fns.isNumber(attributeValue) && fns.isFinite(attributeValue)));
  },
};

},{"../../utils/fns":50,"../enums":46,"@optimizely/js-sdk-utils":26,"lodash/forOwn":203}],45:[function(require,module,exports){
/**
 * Copyright 2016, 2018, 2019 Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var ERROR_MESSAGES = require('../enums').ERROR_MESSAGES;
var MODULE_NAME = 'CONFIG_VALIDATOR';
var DATAFILE_VERSIONS = require('../enums').DATAFILE_VERSIONS;

var SUPPORTED_VERSIONS = [
  DATAFILE_VERSIONS.V2,
  DATAFILE_VERSIONS.V3,
  DATAFILE_VERSIONS.V4
];

/**
 * Provides utility methods for validating that the configuration options are valid
 */
module.exports = {
  /**
   * Validates the given config options
   * @param  {Object} config
   * @param  {Object} config.errorHandler
   * @param  {Object} config.eventDispatcher
   * @param  {Object} config.logger
   * @return {Boolean} True if the config options are valid
   * @throws If any of the config options are not valid
   */
  validate: function(config) {
    if (config.errorHandler && (typeof config.errorHandler.handleError !== 'function')) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_ERROR_HANDLER, MODULE_NAME));
    }

    if (config.eventDispatcher && (typeof config.eventDispatcher.dispatchEvent !== 'function')) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EVENT_DISPATCHER, MODULE_NAME));
    }

    if (config.logger && (typeof config.logger.log !== 'function')) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_LOGGER, MODULE_NAME));
    }

    return true;
  },

  /**
   * Validates the datafile
   * @param {string}  datafile
   * @return {Boolean} True if the datafile is valid
   * @throws If the datafile is not valid for any of the following reasons:
                - The datafile string is undefined
                - The datafile string cannot be parsed as a JSON object
                - The datafile version is not supported
   */
  validateDatafile: function(datafile) {
    if (!datafile) {
      throw new Error(sprintf(ERROR_MESSAGES.NO_DATAFILE_SPECIFIED, MODULE_NAME));
    }

    if (typeof datafile === 'string' || datafile instanceof String) {
      // Attempt to parse the datafile string
      try {
        datafile = JSON.parse(datafile);
      } catch (ex) {
        throw new Error(sprintf(ERROR_MESSAGES.INVALID_DATAFILE_MALFORMED, MODULE_NAME));
      }
    }

    if (SUPPORTED_VERSIONS.indexOf(datafile.version) === -1) {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_DATAFILE_VERSION, MODULE_NAME, datafile.version));
    }

    return true;
  }
};

},{"../enums":46,"@optimizely/js-sdk-utils":26}],46:[function(require,module,exports){
/****************************************************************************
 * Copyright 2016-2019, Optimizely, Inc. and contributors                   *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

var jsSdkUtils = require('@optimizely/js-sdk-utils');

/**
 * Contains global enums used throughout the library
 */
exports.LOG_LEVEL = {
  NOTSET: 0,
  DEBUG: 1,
  INFO: 2,
  WARNING: 3,
  ERROR: 4,
};

exports.ERROR_MESSAGES = {
  CONDITION_EVALUATOR_ERROR: '%s: Error evaluating audience condition of type %s: %s',
  DATAFILE_AND_SDK_KEY_MISSING: '%s: You must provide at least one of sdkKey or datafile. Cannot start Optimizely',
  EXPERIMENT_KEY_NOT_IN_DATAFILE: '%s: Experiment key %s is not in datafile.',
  FEATURE_NOT_IN_DATAFILE: '%s: Feature key %s is not in datafile.',
  IMPROPERLY_FORMATTED_EXPERIMENT: '%s: Experiment key %s is improperly formatted.',
  INVALID_ATTRIBUTES: '%s: Provided attributes are in an invalid format.',
  INVALID_BUCKETING_ID: '%s: Unable to generate hash for bucketing ID %s: %s',
  INVALID_DATAFILE: '%s: Datafile is invalid - property %s: %s',
  INVALID_DATAFILE_MALFORMED: '%s: Datafile is invalid because it is malformed.',
  INVALID_JSON: '%s: JSON object is not valid.',
  INVALID_ERROR_HANDLER: '%s: Provided "errorHandler" is in an invalid format.',
  INVALID_EVENT_DISPATCHER: '%s: Provided "eventDispatcher" is in an invalid format.',
  INVALID_EVENT_KEY: '%s: Event key %s is not in datafile.',
  INVALID_EVENT_TAGS: '%s: Provided event tags are in an invalid format.',
  INVALID_EXPERIMENT_KEY: '%s: Experiment key %s is not in datafile. It is either invalid, paused, or archived.',
  INVALID_EXPERIMENT_ID: '%s: Experiment ID %s is not in datafile.',
  INVALID_GROUP_ID: '%s: Group ID %s is not in datafile.',
  INVALID_LOGGER: '%s: Provided "logger" is in an invalid format.',
  INVALID_ROLLOUT_ID: '%s: Invalid rollout ID %s attached to feature %s',
  INVALID_USER_ID: '%s: Provided user ID is in an invalid format.',
  INVALID_USER_PROFILE_SERVICE: '%s: Provided user profile service instance is in an invalid format: %s.',
  JSON_SCHEMA_EXPECTED: '%s: JSON schema expected.',
  NO_DATAFILE_SPECIFIED: '%s: No datafile specified. Cannot start optimizely.',
  NO_JSON_PROVIDED: '%s: No JSON object to validate against schema.',
  NO_VARIATION_FOR_EXPERIMENT_KEY: '%s: No variation key %s defined in datafile for experiment %s.',
  UNDEFINED_ATTRIBUTE: '%s: Provided attribute: %s has an undefined value.',
  UNRECOGNIZED_ATTRIBUTE: '%s: Unrecognized attribute %s provided. Pruning before sending event to Optimizely.',
  UNABLE_TO_CAST_VALUE: '%s: Unable to cast value %s to type %s, returning null.',
  USER_NOT_IN_FORCED_VARIATION: '%s: User %s is not in the forced variation map. Cannot remove their forced variation.',
  USER_PROFILE_LOOKUP_ERROR: '%s: Error while looking up user profile for user ID "%s": %s.',
  USER_PROFILE_SAVE_ERROR: '%s: Error while saving user profile for user ID "%s": %s.',
  VARIABLE_KEY_NOT_IN_DATAFILE: '%s: Variable with key "%s" associated with feature with key "%s" is not in datafile.',
  VARIATION_ID_NOT_IN_DATAFILE: '%s: No variation ID %s defined in datafile for experiment %s.',
  VARIATION_ID_NOT_IN_DATAFILE_NO_EXPERIMENT: '%s: Variation ID %s is not in the datafile.',
  INVALID_INPUT_FORMAT: '%s: Provided %s is in an invalid format.',
  INVALID_DATAFILE_VERSION: '%s: This version of the JavaScript SDK does not support the given datafile version: %s',
  INVALID_VARIATION_KEY: '%s: Provided variation key is in an invalid format.',
};

exports.LOG_MESSAGES = {
  ACTIVATE_USER: '%s: Activating user %s in experiment %s.',
  DISPATCH_CONVERSION_EVENT: '%s: Dispatching conversion event to URL %s with params %s.',
  DISPATCH_IMPRESSION_EVENT: '%s: Dispatching impression event to URL %s with params %s.',
  DEPRECATED_EVENT_VALUE: '%s: Event value is deprecated in %s call.',
  EXPERIMENT_NOT_RUNNING: '%s: Experiment %s is not running.',
  FEATURE_ENABLED_FOR_USER: '%s: Feature %s is enabled for user %s.',
  FEATURE_NOT_ENABLED_FOR_USER: '%s: Feature %s is not enabled for user %s.',
  FEATURE_HAS_NO_EXPERIMENTS: '%s: Feature %s is not attached to any experiments.',
  FAILED_TO_PARSE_VALUE: '%s: Failed to parse event value "%s" from event tags.',
  FAILED_TO_PARSE_REVENUE: '%s: Failed to parse revenue value "%s" from event tags.',
  FORCED_BUCKETING_FAILED: '%s: Variation key %s is not in datafile. Not activating user %s.',
  INVALID_OBJECT: '%s: Optimizely object is not valid. Failing %s.',
  INVALID_CLIENT_ENGINE: '%s: Invalid client engine passed: %s. Defaulting to node-sdk.',
  INVALID_VARIATION_ID: '%s: Bucketed into an invalid variation ID. Returning null.',
  NOTIFICATION_LISTENER_EXCEPTION: '%s: Notification listener for (%s) threw exception: %s',
  NO_ROLLOUT_EXISTS: '%s: There is no rollout of feature %s.',
  NOT_ACTIVATING_USER: '%s: Not activating user %s for experiment %s.',
  NOT_TRACKING_USER: '%s: Not tracking user %s.',
  PARSED_REVENUE_VALUE: '%s: Parsed revenue value "%s" from event tags.',
  PARSED_NUMERIC_VALUE: '%s: Parsed event value "%s" from event tags.',
  RETURNING_STORED_VARIATION: '%s: Returning previously activated variation "%s" of experiment "%s" for user "%s" from user profile.',
  ROLLOUT_HAS_NO_EXPERIMENTS: '%s: Rollout of feature %s has no experiments',
  SAVED_VARIATION: '%s: Saved variation "%s" of experiment "%s" for user "%s".',
  SAVED_VARIATION_NOT_FOUND: '%s: User %s was previously bucketed into variation with ID %s for experiment %s, but no matching variation was found.',
  SHOULD_NOT_DISPATCH_ACTIVATE: '%s: Experiment %s is not in "Running" state. Not activating user.',
  SKIPPING_JSON_VALIDATION: '%s: Skipping JSON schema validation.',
  TRACK_EVENT: '%s: Tracking event %s for user %s.',
  USER_ASSIGNED_TO_VARIATION_BUCKET: '%s: Assigned variation bucket %s to user %s.',
  USER_ASSIGNED_TO_EXPERIMENT_BUCKET: '%s: Assigned experiment bucket %s to user %s.',
  USER_BUCKETED_INTO_EXPERIMENT_IN_GROUP: '%s: User %s is in experiment %s of group %s.',
  USER_BUCKETED_INTO_TARGETING_RULE: '%s: User %s bucketed into targeting rule %s.',
  USER_IN_FEATURE_EXPERIMENT: '%s: User %s is in variation %s of experiment %s on the feature %s.',
  USER_IN_ROLLOUT: '%s: User %s is in rollout of feature %s.',
  USER_BUCKETED_INTO_EVERYONE_TARGETING_RULE: '%s: User %s bucketed into everyone targeting rule.',
  USER_NOT_BUCKETED_INTO_EVERYONE_TARGETING_RULE: '%s: User %s not bucketed into everyone targeting rule due to traffic allocation.',
  USER_NOT_BUCKETED_INTO_EXPERIMENT_IN_GROUP: '%s: User %s is not in experiment %s of group %s.',
  USER_NOT_BUCKETED_INTO_ANY_EXPERIMENT_IN_GROUP: '%s: User %s is not in any experiment of group %s.',
  USER_NOT_BUCKETED_INTO_TARGETING_RULE: '%s User %s not bucketed into targeting rule %s due to traffic allocation. Trying everyone rule.',
  USER_NOT_IN_FEATURE_EXPERIMENT: '%s: User %s is not in any experiment on the feature %s.',
  USER_NOT_IN_ROLLOUT: '%s: User %s is not in rollout of feature %s.',
  USER_FORCED_IN_VARIATION: '%s: User %s is forced in variation %s.',
  USER_MAPPED_TO_FORCED_VARIATION: '%s: Set variation %s for experiment %s and user %s in the forced variation map.',
  USER_DOESNT_MEET_CONDITIONS_FOR_TARGETING_RULE: '%s: User %s does not meet conditions for targeting rule %s.',
  USER_MEETS_CONDITIONS_FOR_TARGETING_RULE: '%s: User %s meets conditions for targeting rule %s.',
  USER_HAS_VARIATION: '%s: User %s is in variation %s of experiment %s.',
  USER_HAS_FORCED_VARIATION: '%s: Variation %s is mapped to experiment %s and user %s in the forced variation map.',
  USER_HAS_NO_VARIATION: '%s: User %s is in no variation of experiment %s.',
  USER_HAS_NO_FORCED_VARIATION: '%s: User %s is not in the forced variation map.',
  USER_HAS_NO_FORCED_VARIATION_FOR_EXPERIMENT: '%s: No experiment %s mapped to user %s in the forced variation map.',
  USER_NOT_IN_ANY_EXPERIMENT: '%s: User %s is not in any experiment of group %s.',
  USER_NOT_IN_EXPERIMENT: '%s: User %s does not meet conditions to be in experiment %s.',
  USER_RECEIVED_DEFAULT_VARIABLE_VALUE: '%s: User "%s" is not in any variation or rollout rule. Returning default value for variable "%s" of feature flag "%s".',
  FEATURE_NOT_ENABLED_RETURN_DEFAULT_VARIABLE_VALUE: '%s: Feature "%s" is not enabled for user %s. Returning default value for variable "%s".',
  VARIABLE_NOT_USED_RETURN_DEFAULT_VARIABLE_VALUE: '%s: Variable "%s" is not used in variation "%s". Returning default value.',
  USER_RECEIVED_VARIABLE_VALUE: '%s: Value for variable "%s" of feature flag "%s" is %s for user "%s"',
  VALID_DATAFILE: '%s: Datafile is valid.',
  VALID_USER_PROFILE_SERVICE: '%s: Valid user profile service provided.',
  VARIATION_REMOVED_FOR_USER: '%s: Variation mapped to experiment %s has been removed for user %s.',
  VARIABLE_REQUESTED_WITH_WRONG_TYPE: '%s: Requested variable type "%s", but variable is of type "%s". Use correct API to retrieve value. Returning None.',
  VALID_BUCKETING_ID: '%s: BucketingId is valid: "%s"',
  BUCKETING_ID_NOT_STRING: '%s: BucketingID attribute is not a string. Defaulted to userId',
  EVALUATING_AUDIENCE: '%s: Starting to evaluate audience "%s" with conditions: %s.',
  EVALUATING_AUDIENCES_COMBINED: '%s: Evaluating audiences for experiment "%s": %s.',
  AUDIENCE_EVALUATION_RESULT: '%s: Audience "%s" evaluated to %s.',
  AUDIENCE_EVALUATION_RESULT_COMBINED: '%s: Audiences for experiment %s collectively evaluated to %s.',
  MISSING_ATTRIBUTE_VALUE: '%s: Audience condition %s evaluated to UNKNOWN because no value was passed for user attribute "%s".',
  UNEXPECTED_CONDITION_VALUE: '%s: Audience condition %s evaluated to UNKNOWN because the condition value is not supported.',
  UNEXPECTED_TYPE: '%s: Audience condition %s evaluated to UNKNOWN because a value of type "%s" was passed for user attribute "%s".',
  UNEXPECTED_TYPE_NULL: '%s: Audience condition %s evaluated to UNKNOWN because a null value was passed for user attribute "%s".',
  UNKNOWN_CONDITION_TYPE: '%s: Audience condition %s has an unknown condition type. You may need to upgrade to a newer release of the Optimizely SDK.',
  UNKNOWN_MATCH_TYPE: '%s: Audience condition %s uses an unknown match type. You may need to upgrade to a newer release of the Optimizely SDK.',
  UPDATED_OPTIMIZELY_CONFIG: '%s: Updated Optimizely config to revision %s (project id %s)',
  OUT_OF_BOUNDS: '%s: Audience condition %s evaluated to UNKNOWN because the number value for user attribute "%s" is not in the range [-2^53, +2^53].',
  UNABLE_TO_ATTACH_UNLOAD: '%s: unable to bind optimizely.close() to page unload event: "%s"',
};

exports.RESERVED_EVENT_KEYWORDS = {
  REVENUE: 'revenue',
  VALUE: 'value',
};

exports.CONTROL_ATTRIBUTES = {
  BOT_FILTERING: '$opt_bot_filtering',
  BUCKETING_ID: '$opt_bucketing_id',
  STICKY_BUCKETING_KEY: '$opt_experiment_bucket_map',
  USER_AGENT: '$opt_user_agent',
};

exports.JAVASCRIPT_CLIENT_ENGINE = 'javascript-sdk';
exports.NODE_CLIENT_ENGINE = 'node-sdk';
exports.REACT_CLIENT_ENGINE = 'react-sdk';
exports.NODE_CLIENT_VERSION = '3.4.1';

exports.VALID_CLIENT_ENGINES = [
  exports.NODE_CLIENT_ENGINE,
  exports.REACT_CLIENT_ENGINE,
  exports.JAVASCRIPT_CLIENT_ENGINE,
];

exports.NOTIFICATION_TYPES = jsSdkUtils.NOTIFICATION_TYPES;

exports.DECISION_NOTIFICATION_TYPES = {
  AB_TEST: 'ab-test',
  FEATURE: 'feature',
  FEATURE_TEST: 'feature-test',
  FEATURE_VARIABLE: 'feature-variable',
};

/*
 * Represents the source of a decision for feature management. When a feature
 * is accessed through isFeatureEnabled or getVariableValue APIs, the decision
 * source is used to decide whether to dispatch an impression event to
 * Optimizely.
 */
exports.DECISION_SOURCES = {
  FEATURE_TEST: 'feature-test',
  ROLLOUT: 'rollout',
};

/*
 * Possible types of variables attached to features
 */
exports.FEATURE_VARIABLE_TYPES = {
  BOOLEAN: 'boolean',
  DOUBLE: 'double',
  INTEGER: 'integer',
  STRING: 'string',
};

/*
 * Supported datafile versions
 */
exports.DATAFILE_VERSIONS = {
  V2: '2',
  V3: '3',
  V4: '4',
};

},{"@optimizely/js-sdk-utils":26}],47:[function(require,module,exports){
/**
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fns = require('../fns');

/**
 * Return true if the argument is a valid event batch size, false otherwise
 * @param {*} eventBatchSize
 * @returns boolean
 */
function validateEventBatchSize(eventBatchSize) {
  return fns.isFinite(eventBatchSize) && eventBatchSize >= 1;
}

/**
 * Return true if the argument is a valid event flush interval, false otherwise
 * @param {*} eventFlushInterval
 * @returns boolean
 */
function validateEventFlushInterval(eventFlushInterval) {
  return fns.isFinite(eventFlushInterval) && eventFlushInterval > 0;
}

module.exports = {
  validateEventBatchSize: validateEventBatchSize,
  validateEventFlushInterval: validateEventFlushInterval,
};

},{"../fns":50}],48:[function(require,module,exports){
/**
 * Copyright 2017, 2019 Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides utility method for parsing event tag values
 */
var enums = require('../enums');
var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var LOG_LEVEL = enums.LOG_LEVEL;
var LOG_MESSAGES = enums.LOG_MESSAGES;
var MODULE_NAME = 'EVENT_TAG_UTILS';
var REVENUE_EVENT_METRIC_NAME = enums.RESERVED_EVENT_KEYWORDS.REVENUE;
var VALUE_EVENT_METRIC_NAME = enums.RESERVED_EVENT_KEYWORDS.VALUE;

module.exports = {
  /**
   * Grab the revenue value from the event tags. "revenue" is a reserved keyword.
   * @param {Object} eventTags
   * @param {Object} logger
   * @return {Integer|null}
   */
  getRevenueValue: function(eventTags, logger) {
    if (eventTags && eventTags.hasOwnProperty(REVENUE_EVENT_METRIC_NAME)) {
      var rawValue = eventTags[REVENUE_EVENT_METRIC_NAME];
      var parsedRevenueValue = parseInt(rawValue, 10);
      if (isNaN(parsedRevenueValue)) {
        logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.FAILED_TO_PARSE_REVENUE, MODULE_NAME, rawValue));
        return null;
      }
      logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.PARSED_REVENUE_VALUE, MODULE_NAME, parsedRevenueValue));
      return parsedRevenueValue;
    }
    return null;
  },

  /**
   * Grab the event value from the event tags. "value" is a reserved keyword.
   * @param {Object} eventTags
   * @param {Object} logger
   * @return {Number|null}
   */
  getEventValue: function(eventTags, logger) {
    if (eventTags && eventTags.hasOwnProperty(VALUE_EVENT_METRIC_NAME)) {
      var rawValue = eventTags[VALUE_EVENT_METRIC_NAME];
      var parsedEventValue = parseFloat(rawValue);
      if (isNaN(parsedEventValue)) {
        logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.FAILED_TO_PARSE_VALUE, MODULE_NAME, rawValue));
        return null;
      }
      logger.log(LOG_LEVEL.INFO, sprintf(LOG_MESSAGES.PARSED_NUMERIC_VALUE, MODULE_NAME, parsedEventValue));
      return parsedEventValue;
    }
    return null;
  },
};

},{"../enums":46,"@optimizely/js-sdk-utils":26}],49:[function(require,module,exports){
/**
 * Copyright 2017, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides utility method for validating that event tags user has provided are valid
 */

var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var ERROR_MESSAGES = require('../enums').ERROR_MESSAGES;
var MODULE_NAME = 'EVENT_TAGS_VALIDATOR';

module.exports = {
  /**
   * Validates user's provided event tags
   * @param  {Object}  event tags
   * @return {boolean} True if event tags are valid
   * @throws If event tags are not valid
   */
  validate: function(eventTags) {
    if (typeof eventTags === 'object' && !Array.isArray(eventTags) && eventTags !== null) {
      return true;
    } else {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_EVENT_TAGS, MODULE_NAME));
    }
  },
};

},{"../enums":46,"@optimizely/js-sdk-utils":26}],50:[function(require,module,exports){
/**
 * Copyright 2017, 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var uuid = require('uuid');
var _isFinite = require('lodash/isFinite');
var MAX_NUMBER_LIMIT = Math.pow(2, 53);

module.exports = {
  assign: require('lodash/assign'),
  assignIn: require('lodash/assignIn'),
  cloneDeep: require('lodash/cloneDeep'),
  currentTimestamp: function() {
    return Math.round(new Date().getTime());
  },
  isArray: require('lodash/isArray'),
  isEmpty: require('lodash/isEmpty'),
  isFinite: function(number) {
    return _isFinite(number) && Math.abs(number) <= MAX_NUMBER_LIMIT;
  },
  keyBy: require('lodash/keyBy'),
  filter: require('lodash/filter'),
  forEach: require('lodash/forEach'),
  forOwn: require('lodash/forOwn'),
  map: require('lodash/map'),
  uuid: function() {
    return uuid.v4();
  },
  values: require('lodash/values'),
  isNumber: require('lodash/isNumber'),
};

},{"lodash/assign":196,"lodash/assignIn":197,"lodash/cloneDeep":198,"lodash/filter":201,"lodash/forEach":202,"lodash/forOwn":203,"lodash/isArray":208,"lodash/isEmpty":211,"lodash/isFinite":212,"lodash/isNumber":216,"lodash/keyBy":222,"lodash/map":225,"lodash/values":231,"uuid":234}],51:[function(require,module,exports){
/**
 * Copyright 2018, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
  /**
   * Validates provided value is a non-empty string
   * @param  {string}  input
   * @return {boolean} True for non-empty string, false otherwise
   */
  validate: function(input) {
      return typeof input === 'string' && input !== '';
  }
};

},{}],52:[function(require,module,exports){
/****************************************************************************
 * Copyright 2017, Optimizely, Inc. and contributors                        *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

/**
 * Provides utility method for validating that the given user profile service implementation is valid.
 */

var sprintf = require('@optimizely/js-sdk-utils').sprintf;

var ERROR_MESSAGES = require('../enums').ERROR_MESSAGES;
var MODULE_NAME = 'USER_PROFILE_SERVICE_VALIDATOR';

module.exports = {
  /**
   * Validates user's provided user profile service instance
   * @param  {Object}  userProfileServiceInstance
   * @return {boolean} True if the instance is valid
   * @throws If the instance is not valid
   */
  validate: function(userProfileServiceInstance) {
    if (typeof userProfileServiceInstance.lookup !== 'function') {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_USER_PROFILE_SERVICE, MODULE_NAME, 'Missing function \'lookup\''));
    } else if (typeof userProfileServiceInstance.save !== 'function') {
      throw new Error(sprintf(ERROR_MESSAGES.INVALID_USER_PROFILE_SERVICE, MODULE_NAME, 'Missing function \'save\''));
    }
    return true;
  },
};

},{"../enums":46,"@optimizely/js-sdk-utils":26}],53:[function(require,module,exports){
const t=function(){function t(){}return t.prototype.then=function(n,r){const o=new t,i=this.s;if(i){const t=1&i?n:r;if(t){try{e(o,1,t(this.v))}catch(t){e(o,2,t)}return o}return this}return this.o=function(t){try{const i=t.v;1&t.s?e(o,1,n?n(i):i):r?e(o,1,r(i)):e(o,2,i)}catch(t){e(o,2,t)}},o},t}();function e(n,r,o){if(!n.s){if(o instanceof t){if(!o.s)return void(o.o=e.bind(null,n,r));1&r&&(r=o.s),o=o.v}if(o&&o.then)return void o.then(e.bind(null,n,r),e.bind(null,n,2));n.s=r,n.v=o;const i=n.o;i&&i(n)}}var n=0,r="function"==typeof WeakMap?WeakMap:function(){var t="function"==typeof Symbol?Symbol(0):"__weak$"+ ++n;this.set=function(e,n){e[t]=n},this.get=function(e){return e[t]}};function o(t,e){return new Promise(function(n,r){t.onsuccess=function(){var r=t.result;e&&(r=e(r)),n(r)},t.onerror=function(){r(t.error)}})}function i(t,e){return o(t.openCursor(e),function(t){return t?[t.key,t.value]:[]})}function u(t){return new Promise(function(e,n){t.oncomplete=function(){e()},t.onabort=function(){n(t.error)},t.onerror=function(){n(t.error)}})}function c(t){if(!function(t){if("number"==typeof t||"string"==typeof t)return!0;if("object"==typeof t&&t){if(Array.isArray(t))return!0;if("setUTCFullYear"in t)return!0;if("function"==typeof ArrayBuffer&&ArrayBuffer.isView(t))return!0;if("byteLength"in t&&"length"in t)return!0}return!1}(t))throw Error("kv-storage: The given value is not allowed as a key")}var f={};function s(t,e){return i(t,a(e))}function a(t){return t===f?IDBKeyRange.lowerBound(-Infinity):IDBKeyRange.lowerBound(t,!0)}var v=new r,h=new r,l=new r,y=new r,d=function(){};function p(n,r){return r(function(r,o){try{function u(){return h.set(n,f),l.set(n,void 0),{value:d,done:void 0===f}}var c=h.get(n);if(void 0===c)return Promise.resolve({value:void 0,done:!0});var f,v,d,p=function(n,r){var o,i=-1;t:{for(var u=0;u<r.length;u++){var c=r[u][0];if(c){var f=c();if(f&&f.then)break t;if(f===n){i=u;break}}else i=u}if(-1!==i){do{for(var s=r[i][1];!s;)s=r[++i][1];var a=s();if(a&&a.then){o=!0;break t}var v=r[i][2];i++}while(v&&!v());return a}}const h=new t,l=e.bind(null,h,2);return(o?a.then(y):f.then(function t(o){for(;;){if(o===n){i=u;break}if(++u===r.length){if(-1!==i)break;return void e(h,1,s)}if(c=r[u][0]){if((o=c())&&o.then)return void o.then(t).then(void 0,l)}else i=u}do{for(var f=r[i][1];!f;)f=r[++i][1];var s=f();if(s&&s.then)return void s.then(y).then(void 0,l);var a=r[i][2];i++}while(a&&!a());e(h,1,s)})).then(void 0,l),h;function y(t){for(;;){var n=r[i][2];if(!n||n())break;for(var o=r[++i][1];!o;)o=r[++i][1];if((t=o())&&t.then)return void t.then(y).then(void 0,l)}e(h,1,t)}}(y.get(n),[[function(){return"keys"},function(){return Promise.resolve(function(t,e){return i(t,a(e)).then(function(t){return t[0]})}(o,c)).then(function(t){d=f=t})}],[function(){return"values"},function(){return Promise.resolve(s(o,c)).then(function(t){var e;f=(e=t)[0],d=v=e[1]})}],[function(){return"entries"},function(){return Promise.resolve(s(o,c)).then(function(t){var e;v=(e=t)[1],d=void 0===(f=e[0])?void 0:[f,v]})}]]);return Promise.resolve(p&&p.then?p.then(u):u())}catch(t){return Promise.reject(t)}})}function m(t,e){var n=new d;return y.set(n,t),v.set(n,e),h.set(n,f),l.set(n,void 0),n}d.prototype.return=function(){h.set(this,void 0)},d.prototype.next=function(){var t=this,e=v.get(this);if(!e)return Promise.reject(new TypeError("Invalid this value"));var n,r=l.get(this);return n=void 0!==r?r.then(function(){return p(t,e)}):p(this,e),l.set(this,n),n},"function"==typeof Symbol&&Symbol.asyncIterator&&(d.prototype[Symbol.asyncIterator]=function(){return this});var b=function(t,e,n){try{return null===w.get(t)&&function(t){var e=g.get(t);w.set(t,new Promise(function(n,r){var o=self.indexedDB.open(e,1);o.onsuccess=function(){var i=o.result;(function(t,e,n){if(1!==t.objectStoreNames.length)return n(j(e)),!1;if(t.objectStoreNames[0]!==P)return n(j(e)),!1;var r=t.transaction(P,"readonly").objectStore(P);return!(r.autoIncrement||r.keyPath||r.indexNames.length)||(n(j(e)),!1)})(i,e,r)&&(i.onclose=function(){w.set(t,null)},i.onversionchange=function(){i.close(),w.set(t,null)},n(i))},o.onerror=function(){return r(o.error)},o.onupgradeneeded=function(){try{o.result.createObjectStore(P)}catch(t){r(t)}}}))}(t),Promise.resolve(w.get(t)).then(function(t){var r=t.transaction(P,e),o=r.objectStore(P);return n(r,o)})}catch(t){return Promise.reject(t)}},g=new r,w=new r,P="store",k=function(t){var e="kv-storage:"+t;w.set(this,null),g.set(this,e),this.backingStore={database:e,store:P,version:1}};k.prototype.set=function(t,e){try{return c(t),b(this,"readwrite",function(n,r){return void 0===e?r.delete(t):r.put(e,t),u(n)})}catch(t){return Promise.reject(t)}},k.prototype.get=function(t){try{return c(t),b(this,"readonly",function(e,n){return o(n.get(t))})}catch(t){return Promise.reject(t)}},k.prototype.delete=function(t){try{return c(t),b(this,"readwrite",function(e,n){return n.delete(t),u(e)})}catch(t){return Promise.reject(t)}},k.prototype.clear=function(){try{var t=this;function e(){function e(){return o(self.indexedDB.deleteDatabase(g.get(t)))}var r=function(){if(n){try{n.close()}catch(t){}return Promise.resolve(new Promise(setTimeout)).then(function(){})}}();return r&&r.then?r.then(e):e()}var n,r=w.get(t),i=function(){if(null!==r){function e(){w.set(t,null)}var o=function(t,e){try{var o=Promise.resolve(r).then(function(t){n=t})}catch(t){return}return o&&o.then?o.then(void 0,function(){}):o}();return o&&o.then?o.then(e):e()}}();return i&&i.then?i.then(e):e()}catch(t){return Promise.reject(t)}},k.prototype.keys=function(){var t=this;return m("keys",function(e){return b(t,"readonly",e)})},k.prototype.values=function(){var t=this;return m("values",function(e){return b(t,"readonly",e)})},k.prototype.entries=function(){var t=this;return m("entries",function(e){return b(t,"readonly",e)})},"function"==typeof Symbol&&Symbol.asyncIterator&&(k.prototype[Symbol.asyncIterator]=k.prototype.entries);var S=new k("default");function j(t){return new Error('kv-storage: database "'+t+'" corrupted')}exports.StorageArea=k,exports.default=S;


},{}],54:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;

},{"./_getNative":139,"./_root":182}],55:[function(require,module,exports){
var hashClear = require('./_hashClear'),
    hashDelete = require('./_hashDelete'),
    hashGet = require('./_hashGet'),
    hashHas = require('./_hashHas'),
    hashSet = require('./_hashSet');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;

},{"./_hashClear":147,"./_hashDelete":148,"./_hashGet":149,"./_hashHas":150,"./_hashSet":151}],56:[function(require,module,exports){
var listCacheClear = require('./_listCacheClear'),
    listCacheDelete = require('./_listCacheDelete'),
    listCacheGet = require('./_listCacheGet'),
    listCacheHas = require('./_listCacheHas'),
    listCacheSet = require('./_listCacheSet');

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;

},{"./_listCacheClear":162,"./_listCacheDelete":163,"./_listCacheGet":164,"./_listCacheHas":165,"./_listCacheSet":166}],57:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;

},{"./_getNative":139,"./_root":182}],58:[function(require,module,exports){
var mapCacheClear = require('./_mapCacheClear'),
    mapCacheDelete = require('./_mapCacheDelete'),
    mapCacheGet = require('./_mapCacheGet'),
    mapCacheHas = require('./_mapCacheHas'),
    mapCacheSet = require('./_mapCacheSet');

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;

},{"./_mapCacheClear":167,"./_mapCacheDelete":168,"./_mapCacheGet":169,"./_mapCacheHas":170,"./_mapCacheSet":171}],59:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;

},{"./_getNative":139,"./_root":182}],60:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;

},{"./_getNative":139,"./_root":182}],61:[function(require,module,exports){
var MapCache = require('./_MapCache'),
    setCacheAdd = require('./_setCacheAdd'),
    setCacheHas = require('./_setCacheHas');

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;

},{"./_MapCache":58,"./_setCacheAdd":183,"./_setCacheHas":184}],62:[function(require,module,exports){
var ListCache = require('./_ListCache'),
    stackClear = require('./_stackClear'),
    stackDelete = require('./_stackDelete'),
    stackGet = require('./_stackGet'),
    stackHas = require('./_stackHas'),
    stackSet = require('./_stackSet');

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;

},{"./_ListCache":56,"./_stackClear":188,"./_stackDelete":189,"./_stackGet":190,"./_stackHas":191,"./_stackSet":192}],63:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":182}],64:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;

},{"./_root":182}],65:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;

},{"./_getNative":139,"./_root":182}],66:[function(require,module,exports){
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;

},{}],67:[function(require,module,exports){
/**
 * A specialized version of `baseAggregator` for arrays.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} setter The function to set `accumulator` values.
 * @param {Function} iteratee The iteratee to transform keys.
 * @param {Object} accumulator The initial aggregated object.
 * @returns {Function} Returns `accumulator`.
 */
function arrayAggregator(array, setter, iteratee, accumulator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    var value = array[index];
    setter(accumulator, value, iteratee(value), array);
  }
  return accumulator;
}

module.exports = arrayAggregator;

},{}],68:[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],69:[function(require,module,exports){
/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;

},{}],70:[function(require,module,exports){
var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isIndex = require('./_isIndex'),
    isTypedArray = require('./isTypedArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;

},{"./_baseTimes":108,"./_isIndex":155,"./isArguments":207,"./isArray":208,"./isBuffer":210,"./isTypedArray":221}],71:[function(require,module,exports){
/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],72:[function(require,module,exports){
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;

},{}],73:[function(require,module,exports){
/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;

},{}],74:[function(require,module,exports){
var baseAssignValue = require('./_baseAssignValue'),
    eq = require('./eq');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;

},{"./_baseAssignValue":79,"./eq":200}],75:[function(require,module,exports){
var eq = require('./eq');

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;

},{"./eq":200}],76:[function(require,module,exports){
var baseEach = require('./_baseEach');

/**
 * Aggregates elements of `collection` on `accumulator` with keys transformed
 * by `iteratee` and values set by `setter`.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} setter The function to set `accumulator` values.
 * @param {Function} iteratee The iteratee to transform keys.
 * @param {Object} accumulator The initial aggregated object.
 * @returns {Function} Returns `accumulator`.
 */
function baseAggregator(collection, setter, iteratee, accumulator) {
  baseEach(collection, function(value, key, collection) {
    setter(accumulator, value, iteratee(value), collection);
  });
  return accumulator;
}

module.exports = baseAggregator;

},{"./_baseEach":82}],77:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    keys = require('./keys');

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;

},{"./_copyObject":122,"./keys":223}],78:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    keysIn = require('./keysIn');

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;

},{"./_copyObject":122,"./keysIn":224}],79:[function(require,module,exports){
var defineProperty = require('./_defineProperty');

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;

},{"./_defineProperty":130}],80:[function(require,module,exports){
var Stack = require('./_Stack'),
    arrayEach = require('./_arrayEach'),
    assignValue = require('./_assignValue'),
    baseAssign = require('./_baseAssign'),
    baseAssignIn = require('./_baseAssignIn'),
    cloneBuffer = require('./_cloneBuffer'),
    copyArray = require('./_copyArray'),
    copySymbols = require('./_copySymbols'),
    copySymbolsIn = require('./_copySymbolsIn'),
    getAllKeys = require('./_getAllKeys'),
    getAllKeysIn = require('./_getAllKeysIn'),
    getTag = require('./_getTag'),
    initCloneArray = require('./_initCloneArray'),
    initCloneByTag = require('./_initCloneByTag'),
    initCloneObject = require('./_initCloneObject'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isMap = require('./isMap'),
    isObject = require('./isObject'),
    isSet = require('./isSet'),
    keys = require('./keys');

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;

},{"./_Stack":62,"./_arrayEach":68,"./_assignValue":74,"./_baseAssign":77,"./_baseAssignIn":78,"./_cloneBuffer":116,"./_copyArray":121,"./_copySymbols":123,"./_copySymbolsIn":124,"./_getAllKeys":135,"./_getAllKeysIn":136,"./_getTag":144,"./_initCloneArray":152,"./_initCloneByTag":153,"./_initCloneObject":154,"./isArray":208,"./isBuffer":210,"./isMap":215,"./isObject":217,"./isSet":219,"./keys":223}],81:[function(require,module,exports){
var isObject = require('./isObject');

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;

},{"./isObject":217}],82:[function(require,module,exports){
var baseForOwn = require('./_baseForOwn'),
    createBaseEach = require('./_createBaseEach');

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;

},{"./_baseForOwn":85,"./_createBaseEach":128}],83:[function(require,module,exports){
var baseEach = require('./_baseEach');

/**
 * The base implementation of `_.filter` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter(collection, predicate) {
  var result = [];
  baseEach(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

module.exports = baseFilter;

},{"./_baseEach":82}],84:[function(require,module,exports){
var createBaseFor = require('./_createBaseFor');

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"./_createBaseFor":129}],85:[function(require,module,exports){
var baseFor = require('./_baseFor'),
    keys = require('./keys');

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

},{"./_baseFor":84,"./keys":223}],86:[function(require,module,exports){
var castPath = require('./_castPath'),
    toKey = require('./_toKey');

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;

},{"./_castPath":114,"./_toKey":194}],87:[function(require,module,exports){
var arrayPush = require('./_arrayPush'),
    isArray = require('./isArray');

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;

},{"./_arrayPush":72,"./isArray":208}],88:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":63,"./_getRawTag":141,"./_objectToString":179}],89:[function(require,module,exports){
/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;

},{}],90:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;

},{"./_baseGetTag":88,"./isObjectLike":218}],91:[function(require,module,exports){
var baseIsEqualDeep = require('./_baseIsEqualDeep'),
    isObjectLike = require('./isObjectLike');

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;

},{"./_baseIsEqualDeep":92,"./isObjectLike":218}],92:[function(require,module,exports){
var Stack = require('./_Stack'),
    equalArrays = require('./_equalArrays'),
    equalByTag = require('./_equalByTag'),
    equalObjects = require('./_equalObjects'),
    getTag = require('./_getTag'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isTypedArray = require('./isTypedArray');

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;

},{"./_Stack":62,"./_equalArrays":131,"./_equalByTag":132,"./_equalObjects":133,"./_getTag":144,"./isArray":208,"./isBuffer":210,"./isTypedArray":221}],93:[function(require,module,exports){
var getTag = require('./_getTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

module.exports = baseIsMap;

},{"./_getTag":144,"./isObjectLike":218}],94:[function(require,module,exports){
var Stack = require('./_Stack'),
    baseIsEqual = require('./_baseIsEqual');

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

module.exports = baseIsMatch;

},{"./_Stack":62,"./_baseIsEqual":91}],95:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isMasked = require('./_isMasked'),
    isObject = require('./isObject'),
    toSource = require('./_toSource');

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

},{"./_isMasked":159,"./_toSource":195,"./isFunction":213,"./isObject":217}],96:[function(require,module,exports){
var getTag = require('./_getTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

module.exports = baseIsSet;

},{"./_getTag":144,"./isObjectLike":218}],97:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isLength = require('./isLength'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;

},{"./_baseGetTag":88,"./isLength":214,"./isObjectLike":218}],98:[function(require,module,exports){
var baseMatches = require('./_baseMatches'),
    baseMatchesProperty = require('./_baseMatchesProperty'),
    identity = require('./identity'),
    isArray = require('./isArray'),
    property = require('./property');

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

module.exports = baseIteratee;

},{"./_baseMatches":102,"./_baseMatchesProperty":103,"./identity":206,"./isArray":208,"./property":227}],99:[function(require,module,exports){
var isPrototype = require('./_isPrototype'),
    nativeKeys = require('./_nativeKeys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;

},{"./_isPrototype":160,"./_nativeKeys":176}],100:[function(require,module,exports){
var isObject = require('./isObject'),
    isPrototype = require('./_isPrototype'),
    nativeKeysIn = require('./_nativeKeysIn');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;

},{"./_isPrototype":160,"./_nativeKeysIn":177,"./isObject":217}],101:[function(require,module,exports){
var baseEach = require('./_baseEach'),
    isArrayLike = require('./isArrayLike');

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

module.exports = baseMap;

},{"./_baseEach":82,"./isArrayLike":209}],102:[function(require,module,exports){
var baseIsMatch = require('./_baseIsMatch'),
    getMatchData = require('./_getMatchData'),
    matchesStrictComparable = require('./_matchesStrictComparable');

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

module.exports = baseMatches;

},{"./_baseIsMatch":94,"./_getMatchData":138,"./_matchesStrictComparable":173}],103:[function(require,module,exports){
var baseIsEqual = require('./_baseIsEqual'),
    get = require('./get'),
    hasIn = require('./hasIn'),
    isKey = require('./_isKey'),
    isStrictComparable = require('./_isStrictComparable'),
    matchesStrictComparable = require('./_matchesStrictComparable'),
    toKey = require('./_toKey');

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

module.exports = baseMatchesProperty;

},{"./_baseIsEqual":91,"./_isKey":157,"./_isStrictComparable":161,"./_matchesStrictComparable":173,"./_toKey":194,"./get":204,"./hasIn":205}],104:[function(require,module,exports){
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

},{}],105:[function(require,module,exports){
var baseGet = require('./_baseGet');

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

module.exports = basePropertyDeep;

},{"./_baseGet":86}],106:[function(require,module,exports){
var identity = require('./identity'),
    overRest = require('./_overRest'),
    setToString = require('./_setToString');

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;

},{"./_overRest":181,"./_setToString":186,"./identity":206}],107:[function(require,module,exports){
var constant = require('./constant'),
    defineProperty = require('./_defineProperty'),
    identity = require('./identity');

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;

},{"./_defineProperty":130,"./constant":199,"./identity":206}],108:[function(require,module,exports){
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;

},{}],109:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    arrayMap = require('./_arrayMap'),
    isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;

},{"./_Symbol":63,"./_arrayMap":71,"./isArray":208,"./isSymbol":220}],110:[function(require,module,exports){
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;

},{}],111:[function(require,module,exports){
var arrayMap = require('./_arrayMap');

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return arrayMap(props, function(key) {
    return object[key];
  });
}

module.exports = baseValues;

},{"./_arrayMap":71}],112:[function(require,module,exports){
/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;

},{}],113:[function(require,module,exports){
var identity = require('./identity');

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : identity;
}

module.exports = castFunction;

},{"./identity":206}],114:[function(require,module,exports){
var isArray = require('./isArray'),
    isKey = require('./_isKey'),
    stringToPath = require('./_stringToPath'),
    toString = require('./toString');

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;

},{"./_isKey":157,"./_stringToPath":193,"./isArray":208,"./toString":230}],115:[function(require,module,exports){
var Uint8Array = require('./_Uint8Array');

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;

},{"./_Uint8Array":64}],116:[function(require,module,exports){
var root = require('./_root');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;

},{"./_root":182}],117:[function(require,module,exports){
var cloneArrayBuffer = require('./_cloneArrayBuffer');

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;

},{"./_cloneArrayBuffer":115}],118:[function(require,module,exports){
/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;

},{}],119:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;

},{"./_Symbol":63}],120:[function(require,module,exports){
var cloneArrayBuffer = require('./_cloneArrayBuffer');

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;

},{"./_cloneArrayBuffer":115}],121:[function(require,module,exports){
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;

},{}],122:[function(require,module,exports){
var assignValue = require('./_assignValue'),
    baseAssignValue = require('./_baseAssignValue');

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;

},{"./_assignValue":74,"./_baseAssignValue":79}],123:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    getSymbols = require('./_getSymbols');

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;

},{"./_copyObject":122,"./_getSymbols":142}],124:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    getSymbolsIn = require('./_getSymbolsIn');

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;

},{"./_copyObject":122,"./_getSymbolsIn":143}],125:[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":182}],126:[function(require,module,exports){
var arrayAggregator = require('./_arrayAggregator'),
    baseAggregator = require('./_baseAggregator'),
    baseIteratee = require('./_baseIteratee'),
    isArray = require('./isArray');

/**
 * Creates a function like `_.groupBy`.
 *
 * @private
 * @param {Function} setter The function to set accumulator values.
 * @param {Function} [initializer] The accumulator object initializer.
 * @returns {Function} Returns the new aggregator function.
 */
function createAggregator(setter, initializer) {
  return function(collection, iteratee) {
    var func = isArray(collection) ? arrayAggregator : baseAggregator,
        accumulator = initializer ? initializer() : {};

    return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
  };
}

module.exports = createAggregator;

},{"./_arrayAggregator":67,"./_baseAggregator":76,"./_baseIteratee":98,"./isArray":208}],127:[function(require,module,exports){
var baseRest = require('./_baseRest'),
    isIterateeCall = require('./_isIterateeCall');

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"./_baseRest":106,"./_isIterateeCall":156}],128:[function(require,module,exports){
var isArrayLike = require('./isArrayLike');

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;

},{"./isArrayLike":209}],129:[function(require,module,exports){
/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{}],130:[function(require,module,exports){
var getNative = require('./_getNative');

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;

},{"./_getNative":139}],131:[function(require,module,exports){
var SetCache = require('./_SetCache'),
    arraySome = require('./_arraySome'),
    cacheHas = require('./_cacheHas');

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;

},{"./_SetCache":61,"./_arraySome":73,"./_cacheHas":112}],132:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    Uint8Array = require('./_Uint8Array'),
    eq = require('./eq'),
    equalArrays = require('./_equalArrays'),
    mapToArray = require('./_mapToArray'),
    setToArray = require('./_setToArray');

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

module.exports = equalByTag;

},{"./_Symbol":63,"./_Uint8Array":64,"./_equalArrays":131,"./_mapToArray":172,"./_setToArray":185,"./eq":200}],133:[function(require,module,exports){
var getAllKeys = require('./_getAllKeys');

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;

},{"./_getAllKeys":135}],134:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],135:[function(require,module,exports){
var baseGetAllKeys = require('./_baseGetAllKeys'),
    getSymbols = require('./_getSymbols'),
    keys = require('./keys');

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;

},{"./_baseGetAllKeys":87,"./_getSymbols":142,"./keys":223}],136:[function(require,module,exports){
var baseGetAllKeys = require('./_baseGetAllKeys'),
    getSymbolsIn = require('./_getSymbolsIn'),
    keysIn = require('./keysIn');

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;

},{"./_baseGetAllKeys":87,"./_getSymbolsIn":143,"./keysIn":224}],137:[function(require,module,exports){
var isKeyable = require('./_isKeyable');

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;

},{"./_isKeyable":158}],138:[function(require,module,exports){
var isStrictComparable = require('./_isStrictComparable'),
    keys = require('./keys');

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

module.exports = getMatchData;

},{"./_isStrictComparable":161,"./keys":223}],139:[function(require,module,exports){
var baseIsNative = require('./_baseIsNative'),
    getValue = require('./_getValue');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

},{"./_baseIsNative":95,"./_getValue":145}],140:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":180}],141:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":63}],142:[function(require,module,exports){
var arrayFilter = require('./_arrayFilter'),
    stubArray = require('./stubArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;

},{"./_arrayFilter":69,"./stubArray":228}],143:[function(require,module,exports){
var arrayPush = require('./_arrayPush'),
    getPrototype = require('./_getPrototype'),
    getSymbols = require('./_getSymbols'),
    stubArray = require('./stubArray');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;

},{"./_arrayPush":72,"./_getPrototype":140,"./_getSymbols":142,"./stubArray":228}],144:[function(require,module,exports){
var DataView = require('./_DataView'),
    Map = require('./_Map'),
    Promise = require('./_Promise'),
    Set = require('./_Set'),
    WeakMap = require('./_WeakMap'),
    baseGetTag = require('./_baseGetTag'),
    toSource = require('./_toSource');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;

},{"./_DataView":54,"./_Map":57,"./_Promise":59,"./_Set":60,"./_WeakMap":65,"./_baseGetTag":88,"./_toSource":195}],145:[function(require,module,exports){
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

},{}],146:[function(require,module,exports){
var castPath = require('./_castPath'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isIndex = require('./_isIndex'),
    isLength = require('./isLength'),
    toKey = require('./_toKey');

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

module.exports = hasPath;

},{"./_castPath":114,"./_isIndex":155,"./_toKey":194,"./isArguments":207,"./isArray":208,"./isLength":214}],147:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;

},{"./_nativeCreate":175}],148:[function(require,module,exports){
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;

},{}],149:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;

},{"./_nativeCreate":175}],150:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;

},{"./_nativeCreate":175}],151:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;

},{"./_nativeCreate":175}],152:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;

},{}],153:[function(require,module,exports){
var cloneArrayBuffer = require('./_cloneArrayBuffer'),
    cloneDataView = require('./_cloneDataView'),
    cloneRegExp = require('./_cloneRegExp'),
    cloneSymbol = require('./_cloneSymbol'),
    cloneTypedArray = require('./_cloneTypedArray');

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;

},{"./_cloneArrayBuffer":115,"./_cloneDataView":117,"./_cloneRegExp":118,"./_cloneSymbol":119,"./_cloneTypedArray":120}],154:[function(require,module,exports){
var baseCreate = require('./_baseCreate'),
    getPrototype = require('./_getPrototype'),
    isPrototype = require('./_isPrototype');

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;

},{"./_baseCreate":81,"./_getPrototype":140,"./_isPrototype":160}],155:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],156:[function(require,module,exports){
var eq = require('./eq'),
    isArrayLike = require('./isArrayLike'),
    isIndex = require('./_isIndex'),
    isObject = require('./isObject');

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;

},{"./_isIndex":155,"./eq":200,"./isArrayLike":209,"./isObject":217}],157:[function(require,module,exports){
var isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;

},{"./isArray":208,"./isSymbol":220}],158:[function(require,module,exports){
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;

},{}],159:[function(require,module,exports){
var coreJsData = require('./_coreJsData');

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;

},{"./_coreJsData":125}],160:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;

},{}],161:[function(require,module,exports){
var isObject = require('./isObject');

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;

},{"./isObject":217}],162:[function(require,module,exports){
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;

},{}],163:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;

},{"./_assocIndexOf":75}],164:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;

},{"./_assocIndexOf":75}],165:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;

},{"./_assocIndexOf":75}],166:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;

},{"./_assocIndexOf":75}],167:[function(require,module,exports){
var Hash = require('./_Hash'),
    ListCache = require('./_ListCache'),
    Map = require('./_Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;

},{"./_Hash":55,"./_ListCache":56,"./_Map":57}],168:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;

},{"./_getMapData":137}],169:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;

},{"./_getMapData":137}],170:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;

},{"./_getMapData":137}],171:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;

},{"./_getMapData":137}],172:[function(require,module,exports){
/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;

},{}],173:[function(require,module,exports){
/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

module.exports = matchesStrictComparable;

},{}],174:[function(require,module,exports){
var memoize = require('./memoize');

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;

},{"./memoize":226}],175:[function(require,module,exports){
var getNative = require('./_getNative');

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;

},{"./_getNative":139}],176:[function(require,module,exports){
var overArg = require('./_overArg');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;

},{"./_overArg":180}],177:[function(require,module,exports){
/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;

},{}],178:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

},{"./_freeGlobal":134}],179:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],180:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],181:[function(require,module,exports){
var apply = require('./_apply');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;

},{"./_apply":66}],182:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":134}],183:[function(require,module,exports){
/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;

},{}],184:[function(require,module,exports){
/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;

},{}],185:[function(require,module,exports){
/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;

},{}],186:[function(require,module,exports){
var baseSetToString = require('./_baseSetToString'),
    shortOut = require('./_shortOut');

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;

},{"./_baseSetToString":107,"./_shortOut":187}],187:[function(require,module,exports){
/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;

},{}],188:[function(require,module,exports){
var ListCache = require('./_ListCache');

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;

},{"./_ListCache":56}],189:[function(require,module,exports){
/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;

},{}],190:[function(require,module,exports){
/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;

},{}],191:[function(require,module,exports){
/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;

},{}],192:[function(require,module,exports){
var ListCache = require('./_ListCache'),
    Map = require('./_Map'),
    MapCache = require('./_MapCache');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;

},{"./_ListCache":56,"./_Map":57,"./_MapCache":58}],193:[function(require,module,exports){
var memoizeCapped = require('./_memoizeCapped');

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;

},{"./_memoizeCapped":174}],194:[function(require,module,exports){
var isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;

},{"./isSymbol":220}],195:[function(require,module,exports){
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;

},{}],196:[function(require,module,exports){
var assignValue = require('./_assignValue'),
    copyObject = require('./_copyObject'),
    createAssigner = require('./_createAssigner'),
    isArrayLike = require('./isArrayLike'),
    isPrototype = require('./_isPrototype'),
    keys = require('./keys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = createAssigner(function(object, source) {
  if (isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

module.exports = assign;

},{"./_assignValue":74,"./_copyObject":122,"./_createAssigner":127,"./_isPrototype":160,"./isArrayLike":209,"./keys":223}],197:[function(require,module,exports){
var copyObject = require('./_copyObject'),
    createAssigner = require('./_createAssigner'),
    keysIn = require('./keysIn');

/**
 * This method is like `_.assign` except that it iterates over own and
 * inherited source properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assign
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assignIn({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
 */
var assignIn = createAssigner(function(object, source) {
  copyObject(source, keysIn(source), object);
});

module.exports = assignIn;

},{"./_copyObject":122,"./_createAssigner":127,"./keysIn":224}],198:[function(require,module,exports){
var baseClone = require('./_baseClone');

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

module.exports = cloneDeep;

},{"./_baseClone":80}],199:[function(require,module,exports){
/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;

},{}],200:[function(require,module,exports){
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;

},{}],201:[function(require,module,exports){
var arrayFilter = require('./_arrayFilter'),
    baseFilter = require('./_baseFilter'),
    baseIteratee = require('./_baseIteratee'),
    isArray = require('./isArray');

/**
 * Iterates over elements of `collection`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * **Note:** Unlike `_.remove`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see _.reject
 * @example
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * _.filter(users, function(o) { return !o.active; });
 * // => objects for ['fred']
 *
 * // The `_.matches` iteratee shorthand.
 * _.filter(users, { 'age': 36, 'active': true });
 * // => objects for ['barney']
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.filter(users, ['active', false]);
 * // => objects for ['fred']
 *
 * // The `_.property` iteratee shorthand.
 * _.filter(users, 'active');
 * // => objects for ['barney']
 */
function filter(collection, predicate) {
  var func = isArray(collection) ? arrayFilter : baseFilter;
  return func(collection, baseIteratee(predicate, 3));
}

module.exports = filter;

},{"./_arrayFilter":69,"./_baseFilter":83,"./_baseIteratee":98,"./isArray":208}],202:[function(require,module,exports){
var arrayEach = require('./_arrayEach'),
    baseEach = require('./_baseEach'),
    castFunction = require('./_castFunction'),
    isArray = require('./isArray');

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray(collection) ? arrayEach : baseEach;
  return func(collection, castFunction(iteratee));
}

module.exports = forEach;

},{"./_arrayEach":68,"./_baseEach":82,"./_castFunction":113,"./isArray":208}],203:[function(require,module,exports){
var baseForOwn = require('./_baseForOwn'),
    castFunction = require('./_castFunction');

/**
 * Iterates over own enumerable string keyed properties of an object and
 * invokes `iteratee` for each property. The iteratee is invoked with three
 * arguments: (value, key, object). Iteratee functions may exit iteration
 * early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @since 0.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns `object`.
 * @see _.forOwnRight
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.forOwn(new Foo, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forOwn(object, iteratee) {
  return object && baseForOwn(object, castFunction(iteratee));
}

module.exports = forOwn;

},{"./_baseForOwn":85,"./_castFunction":113}],204:[function(require,module,exports){
var baseGet = require('./_baseGet');

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

},{"./_baseGet":86}],205:[function(require,module,exports){
var baseHasIn = require('./_baseHasIn'),
    hasPath = require('./_hasPath');

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;

},{"./_baseHasIn":89,"./_hasPath":146}],206:[function(require,module,exports){
/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],207:[function(require,module,exports){
var baseIsArguments = require('./_baseIsArguments'),
    isObjectLike = require('./isObjectLike');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;

},{"./_baseIsArguments":90,"./isObjectLike":218}],208:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],209:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

},{"./isFunction":213,"./isLength":214}],210:[function(require,module,exports){
var root = require('./_root'),
    stubFalse = require('./stubFalse');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

},{"./_root":182,"./stubFalse":229}],211:[function(require,module,exports){
var baseKeys = require('./_baseKeys'),
    getTag = require('./_getTag'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isArrayLike = require('./isArrayLike'),
    isBuffer = require('./isBuffer'),
    isPrototype = require('./_isPrototype'),
    isTypedArray = require('./isTypedArray');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike(value) &&
      (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer(value) || isTypedArray(value) || isArguments(value))) {
    return !value.length;
  }
  var tag = getTag(value);
  if (tag == mapTag || tag == setTag) {
    return !value.size;
  }
  if (isPrototype(value)) {
    return !baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

module.exports = isEmpty;

},{"./_baseKeys":99,"./_getTag":144,"./_isPrototype":160,"./isArguments":207,"./isArray":208,"./isArrayLike":209,"./isBuffer":210,"./isTypedArray":221}],212:[function(require,module,exports){
var root = require('./_root');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsFinite = root.isFinite;

/**
 * Checks if `value` is a finite primitive number.
 *
 * **Note:** This method is based on
 * [`Number.isFinite`](https://mdn.io/Number/isFinite).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
 * @example
 *
 * _.isFinite(3);
 * // => true
 *
 * _.isFinite(Number.MIN_VALUE);
 * // => true
 *
 * _.isFinite(Infinity);
 * // => false
 *
 * _.isFinite('3');
 * // => false
 */
function isFinite(value) {
  return typeof value == 'number' && nativeIsFinite(value);
}

module.exports = isFinite;

},{"./_root":182}],213:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObject = require('./isObject');

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

},{"./_baseGetTag":88,"./isObject":217}],214:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],215:[function(require,module,exports){
var baseIsMap = require('./_baseIsMap'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

/* Node.js helper references. */
var nodeIsMap = nodeUtil && nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

module.exports = isMap;

},{"./_baseIsMap":93,"./_baseUnary":110,"./_nodeUtil":178}],216:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
 * classified as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a number, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && baseGetTag(value) == numberTag);
}

module.exports = isNumber;

},{"./_baseGetTag":88,"./isObjectLike":218}],217:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],218:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],219:[function(require,module,exports){
var baseIsSet = require('./_baseIsSet'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

module.exports = isSet;

},{"./_baseIsSet":96,"./_baseUnary":110,"./_nodeUtil":178}],220:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;

},{"./_baseGetTag":88,"./isObjectLike":218}],221:[function(require,module,exports){
var baseIsTypedArray = require('./_baseIsTypedArray'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;

},{"./_baseIsTypedArray":97,"./_baseUnary":110,"./_nodeUtil":178}],222:[function(require,module,exports){
var baseAssignValue = require('./_baseAssignValue'),
    createAggregator = require('./_createAggregator');

/**
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` thru `iteratee`. The corresponding value of
 * each key is the last element responsible for generating the key. The
 * iteratee is invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
 * @returns {Object} Returns the composed aggregate object.
 * @example
 *
 * var array = [
 *   { 'dir': 'left', 'code': 97 },
 *   { 'dir': 'right', 'code': 100 }
 * ];
 *
 * _.keyBy(array, function(o) {
 *   return String.fromCharCode(o.code);
 * });
 * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
 *
 * _.keyBy(array, 'dir');
 * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
 */
var keyBy = createAggregator(function(result, value, key) {
  baseAssignValue(result, key, value);
});

module.exports = keyBy;

},{"./_baseAssignValue":79,"./_createAggregator":126}],223:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeys = require('./_baseKeys'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

},{"./_arrayLikeKeys":70,"./_baseKeys":99,"./isArrayLike":209}],224:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeysIn = require('./_baseKeysIn'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;

},{"./_arrayLikeKeys":70,"./_baseKeysIn":100,"./isArrayLike":209}],225:[function(require,module,exports){
var arrayMap = require('./_arrayMap'),
    baseIteratee = require('./_baseIteratee'),
    baseMap = require('./_baseMap'),
    isArray = require('./isArray');

/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map(collection, iteratee) {
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee(iteratee, 3));
}

module.exports = map;

},{"./_arrayMap":71,"./_baseIteratee":98,"./_baseMap":101,"./isArray":208}],226:[function(require,module,exports){
var MapCache = require('./_MapCache');

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;

},{"./_MapCache":58}],227:[function(require,module,exports){
var baseProperty = require('./_baseProperty'),
    basePropertyDeep = require('./_basePropertyDeep'),
    isKey = require('./_isKey'),
    toKey = require('./_toKey');

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = property;

},{"./_baseProperty":104,"./_basePropertyDeep":105,"./_isKey":157,"./_toKey":194}],228:[function(require,module,exports){
/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;

},{}],229:[function(require,module,exports){
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;

},{}],230:[function(require,module,exports){
var baseToString = require('./_baseToString');

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

},{"./_baseToString":109}],231:[function(require,module,exports){
var baseValues = require('./_baseValues'),
    keys = require('./keys');

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return object == null ? [] : baseValues(object, keys(object));
}

module.exports = values;

},{"./_baseValues":111,"./keys":223}],232:[function(require,module,exports){
(function(){
  var _global = this;

  /**
   * JS Implementation of MurmurHash2
   *
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   *
   * @param {string} str ASCII only
   * @param {number} seed Positive integer only
   * @return {number} 32-bit positive integer hash
   */
  function MurmurHashV2(str, seed) {
    var
      l = str.length,
      h = seed ^ l,
      i = 0,
      k;

    while (l >= 4) {
      k =
        ((str.charCodeAt(i) & 0xff)) |
        ((str.charCodeAt(++i) & 0xff) << 8) |
        ((str.charCodeAt(++i) & 0xff) << 16) |
        ((str.charCodeAt(++i) & 0xff) << 24);

      k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
      k ^= k >>> 24;
      k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

      l -= 4;
      ++i;
    }

    switch (l) {
    case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1: h ^= (str.charCodeAt(i) & 0xff);
            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    }

    h ^= h >>> 13;
    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    h ^= h >>> 15;

    return h >>> 0;
  };

  /**
   * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
   *
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   *
   * @param {string} key ASCII only
   * @param {number} seed Positive integer only
   * @return {number} 32-bit positive integer hash
   */
  function MurmurHashV3(key, seed) {
    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
        k1 =
          ((key.charCodeAt(i) & 0xff)) |
          ((key.charCodeAt(++i) & 0xff) << 8) |
          ((key.charCodeAt(++i) & 0xff) << 16) |
          ((key.charCodeAt(++i) & 0xff) << 24);
      ++i;

      k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

      h1 ^= k1;
          h1 = (h1 << 13) | (h1 >>> 19);
      h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
      h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
      case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      case 1: k1 ^= (key.charCodeAt(i) & 0xff);

      k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }

  var murmur = MurmurHashV3;
  murmur.v2 = MurmurHashV2;
  murmur.v3 = MurmurHashV3;

  if (typeof(module) != 'undefined') {
    module.exports = murmur;
  } else {
    var _previousRoot = _global.murmur;
    murmur.noConflict = function() {
      _global.murmur = _previousRoot;
      return murmur;
    }
    _global.murmur = murmur;
  }
}());

},{}],233:[function(require,module,exports){
(function (global,setImmediate){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = finallyConstructor;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!arr || typeof arr.length === 'undefined')
      throw new TypeError('Promise.all accepts an array');
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(values) {
  return new Promise(function(resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      values[i].then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  (typeof setImmediate === 'function' &&
    function(fn) {
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

/** @suppress {undefinedVars} */
var globalNS = (function() {
  // the only reliable means to get the global object is
  // `Function('return this')()`
  // However, this causes CSP violations in Chrome apps.
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw new Error('unable to locate global object');
})();

if (!('Promise' in globalNS)) {
  globalNS['Promise'] = Promise;
} else if (!globalNS.Promise.prototype['finally']) {
  globalNS.Promise.prototype['finally'] = finallyConstructor;
}

})));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"timers":2}],234:[function(require,module,exports){
var v1 = require('./v1');
var v4 = require('./v4');

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;

},{"./v1":237,"./v4":238}],235:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;

},{}],236:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],237:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":235,"./lib/rng":236}],238:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":235,"./lib/rng":236}]},{},[3]);
