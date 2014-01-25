var fs     = require('fs'),
	http   = require('http');

var version = '0.0.2';

var findImageType = function(buffer) {
	var int32View = new Int32Array(buffer);

	switch(int32View[0]) {
		case 137: 
			return "image/png";
		case 255:
			return "image/jpg";
		case 71:
			return "image/gif";
		default:
			throw '6px: Unexpected file type!'
	}
};

var toDataURI = function(buffer) {
	return 'data:'+ findImageType(buffer) + ';base64,' + buffer.toString('base64');
};

var parseInput = function(input, cb) {

	if (typeof input == 'string') {
		fs.readFile(input, function (err, data) {
			if (err) throw err;
			cb(toDataURI(data));
		});
	}

	if (Buffer.isBuffer(input)) {
		cb(toDataURI(input));
	}
};

var sendToServer = function(data, fn) {

	var content = JSON.stringify(data),
		contentLength = content.length;

	var options = {
		host: 'api.6px.io',
		port: 80,
		path: '/users/' + px.userData.userId + '/jobs?key=' + px.userData.apiKey + '&secret=' + px.userData.apiSecret,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': contentLength,
			'User-Agent': '6px Node SDK ' + version
		}
	};

	var response = [];
	var req = http.request(options, function(res) {

		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			response.push(chunk);
		});

		res.on('end', function() {
			fn(response.join(''));
		});

	});

	req.on('error', function(e) {
		console.log('problem with request', e.message);
	});

	// write data to request body
	req.write(content);
	req.end();
};

var _6px = function(input) {
	this.image = input;
	this.tag = false;
	this.type = 'image/png';
	this.callback = false;
	this.actions = [];
	this.hasFilters = false;
	this.filters = {};
	this.filters = {};
};

/**
 * Resize input
 *
 * @param {object} size: Pass in width and/or height
 */
_6px.prototype.resize = function(size) {

	this.actions.push({ method: 'resize', options: size });

	return this;
};

_6px.prototype.filter = function(type, value) {

	// User took a shortcut and used an object to define them all at once
	if (typeof type == 'object') {
		this.filters = type;
	} else {
		this.filters[type] = value;
	}

	this.hasFilters = true;

	return this;
};

_6px.prototype.rotate = function(options) {

	this.actions.push({ method: 'rotate', options: options });

	return this;
};

_6px.prototype.crop = function(position) {
	
	this.actions.push({ method: 'crop', options: position });

	return this;
};

_6px.prototype.tag = function(tag) {
	this.tag = tag;

	return this;
};

_6px.prototype.callback = function(url) {

	this.url = url;

	return this;
};

_6px.prototype.type = function(mime) {
	this.type = mime;

	return this;
};

_6px.prototype.save = function(options, fn) {
	
	var _this = this;

	if (typeof options == 'function') {
		var fn = options;
		var options = {};
	}

	// Combine all of the filters set into one action (if they exist)
	if (this.hasFilters) {
		this.actions.push({ method: 'filter', options: this.filters });
	}

	var json = {
		callback: {
			url: this.callback || null
		},
		priority: (this.priority || 0),
		user_id: px.userData.userId,
		output: [{
			ref: [ 'main' ],
			tag: this.tag || null,
			type: this.type,
			methods: this.actions
		}]
	};

	parseInput(this.image, function(data) {
		
		json.input = {};
		json.input['main'] = data;

		sendToServer(json,
			function(res) {
				fn(null, res);
			},
			function() {
				fn(true);
			});

	});

};

var px = function(input) {

	if (!px.userData) {
		throw '6px: You must call init!';
	}

	return new _6px(input);
};

px.version = version;

px.priorities = {
	high: 1,
	normal: 0
};

/**
 * Use this to set up your account with apiKey, etc
 */
px.init = function(data) {

	if (!data.apiKey) {
		throw '6px: apiKey is required!';
	}

	if (!data.apiSecret) {
		throw '6px: apiSecret is required!';
	}

	if (!data.userId) {
		throw '6px: userId is required!';
	}

	px.userData = data;
};

module.exports.px = px;