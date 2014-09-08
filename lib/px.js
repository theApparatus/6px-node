'use strict';

var version = require('../package.json').version;

var fs          = require('fs'),
    url         = require('url'),
    Promise     = require('promise'),
    WebSocket   = require('ws'),
    querystring = require('querystring'),
    request     = require('request'),
    Events      = new (require('events').EventEmitter);

var Output = require('./output'),
    Result = require('./result');

/**
 * Constructor
 */
var _6px = function(images) {

    // Setting some default values
    this.reset();

    if (images && typeof images == 'object') {
        Object.keys(images).forEach(function(index) {
            this.load(index, images[index]);
        }, this);
    }

};

/**
* Reset the request
*/
_6px.prototype.reset = function() {
    // Setting some default values
    this.images = {};
    this.outputs = [];
    this.callback = false;
};

/**
 * Load an input.
 *
 * Define a name and then where the file is.  Could be a local file or a file
 * somewhere online.
 *
 * @method load
 * @param {String} name The name we want to give our image.
 * @param {Mixed}  path The location or the file itself.  Can be a Buffer, relative path, or location on the web.
 * @chainable
 */
_6px.prototype.load = function(name, path) {

    this.images[name] = path;

    return this;
};

/**
 * Shortcut for sending an image and just getting the info about it.
 */
_6px.prototype.getInfo = function(fn) {

    var _this = this;

	return new Promise(function(resolve, reject) {
        var refs = {};
        Object.keys(_this.images).forEach(function(index) {
            refs[index] = false;
        });

        _this.output(refs)
            .tag('info');

        _this.save().then(function(res) {

            var r = new Result.Info(res);

            resolve(r);

            if (fn) fn(null, r);

        }, function(err) {

            reject(err);
            if (fn) fn(err);

        });

    });



};

/**
 * Shortcut for uploading an image to our CDN and returning the location.
 */
_6px.prototype.upload = function(fn) {

    var _this = this;

	return new Promise(function(resolve, reject) {
        var refs = {};
        Object.keys(_this.images).forEach(function(index) {
            refs[index] = false;
        });

        _this.output(refs)
            .url('6px')
            .tag('info');

        _this.save().then(function(res) {

            var r = new Result.Info(res);

            resolve(r);
            if (fn) fn(null, r);

        }, function(err) {

            reject(err);
            if (fn) fn(err);

        });
    });
};

/**
 * Create a new output.
 *
 * Will create an Output object and add it to the list of outputs.
 *
 * @method  output
 * @param   {Object} refs A key/value pair.  Key refers to the ref (input name).  Value is the filename you wish to have.  If false, we will generate one for you.
 * @returns {Output} An output object
 */
_6px.prototype.output = function(refs) {

    var output = new Output(refs);

    this.outputs.push(output);

    return output;
};

/**
 * Set a callback URL for the API to send a POST request to when finished.
 *
 * @method callback
 * @param {String} url The URL to post to
 * @chainable
 */
_6px.prototype.callback = function(url) {

    this.url = url;

    return this;

};

/**
 * Grab an output that has been already defined and tagged.
 *
 * @param {String} tag The tag name you want to search for
 */
_6px.prototype.getOutputByTagName = function(tag) {

	var relevant = this.outputs.filter(function(out) {
		return out.tagName == tag;
	});

	return (relevant.length > 0) ? relevant[0] : null;
};

/**
 * Send the request up to 6px for processing.
 *
 * @method save
 * @param {Object} [options] Some saving options.  Described above.
 * @param {Function} [fn] Callback function.  Ran whenever we hear back from the API that the request was sent.  Does not mean the job has finished.
 */
_6px.prototype.save = function(options, fn) {

    var _this = this;

    var p = new Promise(function(resolve, reject) {

        if (typeof options == 'function') {
            var fn = options;
            var options = {};
        }

        var inputs = {};

        var inputTotal = Object.keys(_this.images),
            inputTotalLen = inputTotal.length;

        var done = function() {

            var json = {
                input: inputs,
                output: _this.outputs.map(function(output) {
                    return output.export();
                })
            };

            if (_this.callback) {

                json.callback = {
                    url: _this.callback
                };

            }

            px.sendToServer(
                'post',
                '/v1/users/:userId/jobs',
                json
            ).then(function(res) {

                    px.once('job.done.'+ res.id, function(e) {

						px.get(res.id)
                            .then(function(job) {
    							resolve(new Result(job.processed));
    						});

					});

                },
                function() {

                    reject('Error sending to server')

                });

        };

        // parse the inputs, then run done() when finished.
        inputTotal.forEach(function(index) {

            px.parseInput(this.images[index], function(data) {

                inputs[index] = data;

                if (!--inputTotalLen) {
                    done();
                }

            });

        }, _this);
    });

    if (fn) {
        p.then(function(r) {
            fn.call(_this, null, r);
        }, function(err) {
            fn.call(_this, err);
        });
    }

    return p;

};

/**
 * The main px object and convenience functions.
 *
 * Will throw an exception if px.init has not been called.
 */
GLOBAL.px = function(input) {

    if (!px.userData) {
        throw '6px: You must call init!';
    }

    return new _6px(input);

};

px.get = function(jobId, cb, binding) {

	var r = px.sendToServer(
        'get',
        '/v1/users/:userId/jobs/'+ jobId,
        false
    );

    if (cb) {
        r.then(function(res) {
            cb.call((binding || window), res);
        }, function(err) {
            cb.call((binding || window), err);
        });
    }

    return r;

};

px.on = function(name, fn) {
    Events.on(name, function(args) {
        fn.apply(px, (args || []));
    });

    if (name == 'connection' && px.connected) {
        px.emit('connection');
    }
};

px.once = function(name, fn) {
    Events.once(name, function(args) {
        fn.apply(px, (args || []));
    });
};

px.emit = function(name, args) {
    Events.emit(name, args);
};

px.trigger = px.emit;

px.openSocket = function() {
    var host = 'ws://socks.6px.io';

	var socket = new WebSocket(host);

	socket.onopen = function() {
		// Send up a simple auth command, which will register our session
		px.sendSocketMsg(socket, { auth: { user_id: px.userData.userId } });
	};

	// ping server to keep socket connection open (closes after 55s)
	setInterval(function() {
		socket.send(JSON.stringify({ ping: true }));
	}, 30000);

	socket.onclose = function() {
		setTimeout(function() {
			px.openSocket();
		}, 1000);
	};

	socket.onmessage = function(msg) {
		px.handleIncoming(msg);
	};
};

px.sendSocketMsg = function(socket, obj) {
	socket.send(JSON.stringify(obj));
};

px.handleIncoming = function(msg) {
	var data = JSON.parse(msg.data);

	if (data.auth && data.auth === true) {
        px.connected = true;
		px.trigger('connection');
	}

	if (data.job_id && data.status) {
		px.trigger('job.update', [data.job_id, data.status]);
	}
};

/**
 * Utility to parse through an input.
 *
 * @param {Mixed}   input  The image data.  Location on the web or Buffer.
 * @param {Function} cb    The callback function with the results.
 */
px.parseInput = function(input, cb) {

    if (typeof input == 'string') {

        var parsed = url.parse(input);

        if (parsed.protocol) {
            cb(input);
            return;
        }

        fs.readFile(input, function (err, data) {
            if (err) throw err;
            cb(px.toDataURI(data));
        });
    }

    if (Buffer.isBuffer(input)) {
        cb(px.toDataURI(input));
    }

};

/**
 * Sends our data up to the 6px server
 *
 * Basically a wrapper that sends a request to the 6px API server
 */
px.sendToServer = function(method, path, data, fn) {

    return new Promise(function(resolve, reject) {

        var content = false;
        var headers = {};

        if (data) {

            content = JSON.stringify(data);

            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = content.length;
            headers['User-Agent'] = '6px Node SDK ' + version;
        }

        path = path.replace(':userId', px.userData.userId);

        var options = {
            strictSSL: false,
            rejectUnauthorized: false,
            pool: false,
            method: method.toUpperCase(),
            url: 'https://api.6px.io' + path,
            qs: { key: px.userData.apiKey, secret: px.userData.apiSecret },
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': '6px Node SDK '+ version
            }
        };

        if (data) {
            options.json = data;
        }

        request(options, function(err, response, body) {

            if (!err && response.statusCode < 400) {

                var bod = body;
                try {
                    bod = JSON.parse(body);
                } catch(e) {}

                return resolve(bod);
            }

            reject(err);
        });

    });

};

/**
 * Utility to merge two objects together and return the result as a new object.
 *
 * @param {Object} obj1 [description]
 * @param {[type]} obj2 [description]
 */
px.mergeObject = function(obj1, obj2) {

    var obj3 = {};

    Object.keys(obj1).forEach(function(index) {
        obj3[index] = obj1[index];
    });

    Object.keys(obj2).forEach(function(index) {
        obj3[index] = obj2[index];
    });

    return obj3;

};


/**
 * Figures out the image type a file is from a buffer.
 */
px.findImageType = function(buffer) {
    var int32View = new Int32Array(buffer);

    switch(int32View[0]) {
        case 71:
            return 'image/gif';
        case 137:
            return 'image/png';
        case 255:
            return "image/jpg";
        case 71:
            return "image/gif";
        default:
            throw '6px: Unsupported file type!'
    }
};

/**
 * Converts a buffer into a dataURI
 *
 * @param {Buffer} buffer The buffer to convert.
 */
px.toDataURI = function(buffer) {
    return 'data:' + px.findImageType(buffer) + ';base64,' + buffer.toString('base64');
};

// Not used yet
px.callbacks = {
    express: function(req, res) {

    }
};

px.version = version;

/**
 * Initializes our px object and makes sure we set the right variables.
 *
 * Expects an object with all of these defined: apiKey, userId, apiSecret
 */
module.exports = function(data) {

    if (!data) {
        var data = {};
    }

    px.connected = false;

    var env = process.env,
        apiKey = (data.apiKey || env['CLOUD6_API_KEY']),
        apiSecret = (data.apiSecret || env['CLOUD6_API_SECRET']),
        userId = (data.userId || env['CLOUD6_USER_ID']);

    if (!apiKey) {
        throw '6px: apiKey is required!';
    }

    if (!userId) {
        throw '6px: userId is required!';
    }

    if (!apiSecret) {
        throw '6px: apiSecret is required!';
    }

    px.openSocket();

	px.on('job.update', function(jobId, status) {
		if (status == 'complete') {
			px.emit('job.done.'+ jobId);
		}
	});

    px.userData = {
        userId: userId,
        apiSecret: apiSecret,
        apiKey: apiKey
    };

    return px;
};
