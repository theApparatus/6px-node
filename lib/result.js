'use strict';

var Result = function(data) {

	this.data = data;

	this.outputs = {};

	this.data.forEach(function(val, index) {
		this.outputs[val.name] = new Result.Output(val);
	}, this);

};

Result.prototype.getOutput = function(outputName) {
	return this.outputs[outputName];
};

Result.Output = function(data) {

	this.data = data;

	this.refs = {};

	Object.keys(this.data.data.output).forEach(function(index) {
		this.refs[index] = this.data.data.output[index];
	}, this);

};

Result.Output.prototype.getLocation = function(refName) {
	return this.refs[refName].location;
};

Result.Output.prototype.getWidth = function(refName) {
	return this.refs[refName].info.width;
};

Result.Output.prototype.getHeight = function(refName) {
	return this.refs[refName].info.height;
};

Result.Output.prototype.getSize = function(refName) {
	return this.refs[refName].info;
};

Result.Output.prototype.getBytes = function(refName) {
	return this.refs[refName].info.bytes;
};

/**
 * A response object formatted for an info call
 */
Result.Info = function(data) {
	this.data = data.getOutput('info');
};

Result.Info.prototype.getWidth = function(refName) {
	return this.data.getWidth(refName);
};

Result.Info.prototype.getHeight = function(refName) {
	return this.data.getHeight(refName);
};

Result.Info.prototype.getBytes = function(refName) {
	return this.data.getBytes(refName);
};

Result.Info.prototype.getSize = function(refName) {
	return this.data.getSize(refName);
};

module.exports = Result;
