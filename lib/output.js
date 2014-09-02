'use strict';

/**
 * Represents an Output through 6px.
 *
 * Outputs are basically images that are created through 6px.  It contains all of
 * the information needed to build the image.
 */
var Output = function(refs) {

    this.refs = (refs || {});

    this.type = 'image/png';
    this.urlLocation = false;
    this.actions = [];
    this.hasFilters = false;
    this.filters = {};
    this.tagName = '';

    this.data = {};

};

/**
 * It's pretty crucial to give your outputs a name so that you can easily
 * grab the information that you need from the processed object returned from
 * the API.
 *
 * @param  {String} name The name of the output
 * @chainable
 */
Output.prototype.tag = function(name) {

    this.tagName = name;

    return this;
};

/**
 * Resize an image based off of the size object.
 *
 * If you just pass one value (width or height) the omitted value is assumed based on the aspect ratio.
 *
 * @method resize
 * @param  {Object} size [description]
 * @chainable
 */
Output.prototype.resize = function(size) {

    this.data.resize = px.mergeObject((this.data.resize || {}), size);

    return this;

};

/**
 * Add some filters to an image
 *
 * @method filter
 * @param  {String} type  The filter name.  For instance: 'sepia'
 * @param  {Mixed} value  The value or strength that you are looking for.
 * @chainable
 */
Output.prototype.filter = function(type, value) {

    if (typeof type == 'object' && !(type instanceof Array)) {

        this.filters = type;

        this.hasFilters = true;

        return this;

    }

    this.filters[type] = value;

    this.hasFilters = true;

    return this;
};

/**
 * The location that we will attempt to save this to.
 *
 * The most convenient would be to save simply to 6px's CDN. To do that, just
 * pass in '6px'.
 *
 * @method url
 * @param  {String} location The location to save this to.
 * @chainable
 */
Output.prototype.url = function(location) {

    this.urlLocation = location;

    return this;

};

/**
 * Rotate an image
 *
 * @method rotate
 * @param  {Object} options Pass in degrees.  Pass in the optional background color as `color` (it assumes 'transparent')
 * @chainable
 */
Output.prototype.rotate = function(options) {

    this.data.rotate = px.mergeObject((this.data.rotate || {}), options);

    return this;

};

/**
 * Crop the image
 *
 * @method crop
 * @param  {Object} position Contains x, y, width, and height
 * @chainable
 */
Output.prototype.crop = function(position) {

    this.data.crop = px.mergeObject((this.data.crop || {}), position);

    return this;
};

/**
 * Place one input ontop of another.  Watermarking.
 *
 * @method layer
 * @param  {String} refName The name of the input you want to put on top.
 * @param  {Object} options The options object that contains (all optional): opacity, x, y, width, height
 * @chainable
 */
Output.prototype.layer = function(refName, options) {

    var action = {
        method: 'layer',
        options: {
            ref: refName
        }
    };

    if (options && typeof options == 'object' && !(options instanceof Array)) {

        Object.keys(options).forEach(function(index) {
            action.options[index] = options[index];
        });

    }

    this.actions.push(action);

    return this;

};

/**
 * The mime type to save this out as
 *
 * It assumes 'image/png'.
 *
 * @method type
 * @param  {String} mime The mime type to save as
 * @chainable
 */
Output.prototype.type = function(mime) {

    this.type = mime;

    return this;

};

/**
 * Called by the SDK to make sense of all of the data the user inputted.
 *
 * @method export
 * @return {Object}
 */
Output.prototype.export = function() {

    if (this.hasFilters) {

        this.actions.push({
            method: 'filter',
            options: this.filters
        });

    }

    Object.keys(this.data).forEach(function(index) {

		var val = this.data[index];

		this.actions.push({
			method: index,
			options: val
		});

	}, this);


    var output = {
        ref: this.refs,
        type: this.type,
        tag: this.tagName,
        methods: this.actions
    };

    if (this.urlLocation) {
        output.url = this.urlLocation;
    }

    return output;

};

module.exports = Output;
