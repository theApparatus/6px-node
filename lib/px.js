'use strict';

var version = require('../package.json').version;

var fs     = require('fs'),
    https  = require('https'),
    url    = require('url');

var Output = require('./output');

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
 * Send the request up to 6px for processing.
 *
 * @method save
 * @param {Object} [options] Some saving options.  Described above.
 * @param {Function} [fn] Callback function.  Ran whenever we hear back from the API that the request was sent.  Does not mean the job has finished.
 * @chainable
 */
_6px.prototype.save = function(options, fn) {

    var _this = this;

    if (typeof options == 'function') {
        var fn = options;
        var options = {};
    }

    var inputs = {};

    var inputTotal = Object.keys(this.images),
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

        px.sendToServer(json,
            function(res) {
                fn(null, res);
            },
            function() {
                fn(true);
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

    }, this);

};

/**
 * The main px object and convenience functions.
 *
 * Will throw an exception if px.init has not been called.
 */
var px = function(input) {

    if (!px.userData) {
        throw '6px: You must call init!';
    }

    return new _6px(input);

};

// Not used yet
px.openSocket = function() {

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
px.sendToServer = function(data, fn) {

    var content = JSON.stringify(data),
        contentLength = content.length;

    var options = {
        host: 'api.6px.io',
        port: 443,
        path: '/v1/users/' + px.userData.userId + '/jobs?key=' + px.userData.apiKey + '&secret=' + px.userData.apiSecret,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': contentLength,
            'User-Agent': '6px Node SDK ' + version
        },
        rejectUnauthorized: false
    };

    var response = [];
    var req = https.request(options, function(res) {

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            response.push(chunk);
        });

        res.on('end', function() {
            fn(JSON.parse(response.join('')));
        });

    });

    req.on('error', function(e) {
        console.log('problem with request', e.message);
    });

    // write data to request body
    req.write(content);
    req.end();

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

    if (px.userData) {
        throw '6px: Init must only be called once!';
    }

    if (!data.apiKey) {
        throw '6px: apiKey is required!';
    }

    if (!data.userId) {
        throw '6px: userId is required!';
    }

    if (!data.apiSecret) {
        throw '6px: apiSecret is required!';
    }

    px.userData = data;

    return px;
};
