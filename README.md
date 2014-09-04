Node.js module for 6px
======================

Node.js module for interacting with the [6px API](http://6px.io). This module includes methods that makes sending image processing jobs to 6px easier.

## Getting Started

Install the NPM package:
```bash
$ npm install 6px
```
##Examples
Upload an image to 6px:
```javascript
var px = require('6px')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

px.on('connection', function() {
    var image = px({taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg'});
    var output = image.output({ taxi: 'unsplashed_taxi' }).tag('img').url('6px');

    image.save().then(function(res) {
        console.log('Done:', res);
    }, function(err) {
        console.log('Error:', err);
    });
});
```

Given that vintage photos are kind of kind of popular right now, let's take this up a notch:
```javascript
var px = require('6px')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

px.on('connection', function() {
    var image = px({taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg'});
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('vintage')
        .url('6px')
        .filter({ sepia: 70 });

    image.save().then(function(res) {
        console.log('Done:', res);
    }, function(err) {
        console.log('Error:', err);
    });
});
```
So, we have a bit of an extreme sepia effect going on here, but that's fine.  I think this deserves to be more of a thumbnail.  We are going to resize it now:
```javascript
var px = require('6px')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

px.on('connection', function() {
    var image = px({taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg'});
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('vintage_thumb')
        .url('6px')
        .filter({ sepia: 70 })
        .resize({ width: 75 });

    image.save().then(function(res) {
        console.log('Done:', res);
    }, function(err) {
        console.log('Error:', err);
    });
});
```
Another thing we can do is change the dominate color of an image:
```javascript
var px = require('6px')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

px.on('connection', function() {
    var image = px({taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg'});
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('green')
        .url('6px')
        .filter({ colorize: { hex: '#00FF00', strength: 80 } });

    image.save().then(function(res) {
        console.log('Done:', res);
    }, function(err) {
        console.log('Error:', err);
    });
});

```
Let's blur the image at the same time.
```javascript
var px = require('6px')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

px.on('connection', function() {
    var image = px({taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg'});
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('green_blur')
        .url('6px')
        .filter({
            colorize: { hex: '#00FF00', strength: 80 },
            stackBlur: 20
        });

    image.save().then(function(res) {
        console.log('Done:', res);
    }, function(err) {
        console.log('Error:', err);
    });
});
```
Now that we have covered some of the simple use cases, feel free to refer to our documentation!

##[API Documentation](https://github.com/6px-io/6px-api-docs)

Keep us posted on the cool stuff you are doing by sending us an email at <ops@6px.io>. We are constantly trying to improve the user experience. If you come across any issues or have suggestions please create an [issue ticket.](https://github.com/6px-io/6px-node/issues)
