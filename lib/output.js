'use strict';

var Output = function(refs) {

    this.refs = (refs || {});

    this.type = 'image/png';
    this.urlLocation = false;
    this.actions = [];
    this.hasFilters = false;
    this.filters = {};

};

Output.prototype.resize = function(size) {

    this.actions.push({
        method: 'resize',
        options: size
    });

    return this;

};

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

Output.prototype.url = function(location) {

    this.urlLocation = location;

    return this;

};

Output.prototype.rotate = function(options) {

    this.actions.push({
        method: 'rotate',
        options: options
    });

    return this;

};

Output.prototype.crop = function(position) {

    this.actions.push({
        method: 'crop',
        options: position
    });

    return this;
};

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

Output.prototype.type = function(mime) {

    this.type = mime;

    return this;

};

Output.prototype.export = function() {

    if (this.hasFilters) {

        this.actions.push({
            method: 'filter',
            options: this.filters
        });

    }

    var output = {
        ref: this.refs,
        type: this.type,
        methods: this.actions
    };

    if (this.urlLocation) {
        output.url = this.urlLocation;
    }

    return output;

};

module.exports = Output;
