Node.js module for 6px
======================

Node.js module for interacting with the [6px API](http://6px.io). This module includes methods that makes sending image processing jobs to 6px easier.

## Getting Started

### Installation

Use [NPM](https://www.npmjs.org/package/6px) to install the 6px Node.js module. The following command will download, build, and add the 6px module to your `package.json` file.

```term
$ npm install 6px --save
```

Alternatively, you can include the 6px module manually by adding 6px as a dependency in your `package.json` file.

```json
"dependencies": {
    "6px": "0.0.18"
}
```

### Initialization

Auto initialize (assuming that the required env vars are available):

```javascript
var px = require('6px')();
```

Initialize using environment variables:

```javascript
var px = require('6px')({
    userId: process.env.CLOUD6_USER_ID,
    apiKey: process.env.CLOUD6_API_KEY,
    apiSecret: process.env.CLOUD6_API_SECRET
});
```

Initialize with hard coded values:

```javascript
var px = require('6px')({
    userId: 'YOUR_USER_ID',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET'
});
```

### Examples

Upload an image to 6px with a specified tag name:

```javascript
var px = require('6px')();

px.on('connection', function() {

    var image = px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' });
    var output = image.output({ taxi: 'unsplashed_taxi' }).tag('img').url('6px');

    image.save().then(function(res) {
        console.log('Res', res);
    }, function(err) {
        console.log('Err', err);
    });

});
```

> **Note**: When the callback on the save object is fired, it is only the API's acknowledgment that it has received the request.

Apply a vintage look to an image and upload to 6px:

```javascript
var px = require('6px')();

px.on('connection', function() {

    var image = px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' });
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('vintage')
        .url('6px')
        .filter({ sepia: 70 });

    image.save().then(function(res) {
        console.log('Res', res);
    }, function(err) {
        console.log('Err', err);
    });

});
```

Apply a vintage look, generate a thumbnail, and upload to 6px:

```javascript
var px = require('6px')();

px.on('connection', function() {

    var image = px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' });
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('vintage_thumb')
        .url('6px')
        .filter({ sepia: 70 })
        .resize({ width: 75 });

    image.save().then(function(res) {
        console.log('Res', res);
    }, function(err) {
        console.log('Err', err);
    });

});
```

Change the dominant color of an image and upload to 6px:

```javascript
var px = require('6px')();

px.on('connection', function() {

    var image = px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' });
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('green')
        .url('6px')
        .filter({ colorize: { hex: '#00FF00', strength: 80 } });

    image.save().then(function(res) {
        console.log('Res', res);
    }, function(err) {
        console.log('Err', err);
    });

});
```

Change the dominant color of an image, apply a blur effect, and upload to 6px:

```javascript
var px = require('6px')();

px.on('connection', function() {

    var image = px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' });
    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('green_blur')
        .url('6px')
        .filter({
            colorize: { hex: '#00FF00', strength: 80 },
            stackBlur: 20
        });

    image.save().then(function(res) {
        console.log('Res', res);
    }, function(err) {
        console.log('Err', err);
    });

});
```

Get info (e.g. height, width, bytes, size, etc.) on an image:

```javascript
var px = require('6px')();

px.on('connection', function() {

    var image = px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' });

    image.getInfo().then(function(res) {
        console.log('Res', res);
    }, function(err) {
        console.log('Err', err);
    });

});
```

Override previously specified output using its tag name:

```javascript
var px = require('6px')();

px.on('connection', function() {

    var image = px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' });

    var output = image.output({ taxi: 'unsplashed_taxi' })
        .tag('thumb')
        .url('6px')
        .resize({
            height: 200,
            width: 200
        });

    // optionally override previously specified output
    image.getOutputByTagName('thumb').resize({ height: 400, width: 400 });

    image.save().then(function(res) {
        console.log('Res', res);
    }, function(err) {
        console.log('Err', err);
    });

});
```

Convenience function for uploading an image without specifying methods:

```javascript
var px = require('6px')();

px.on('connection', function() {

    px({ taxi: 'https://s3.amazonaws.com/ooomf-com-files/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg' })
        .upload().then(function(res) {
            console.log('Res', res);
        }, function(err) {
            console.log('Err', err);
        })
    ;

});
```

> **Note**: The examples above cover a couple of the many use cases. Please refer to the [official API documentation](https://github.com/6px-io/6px-api-docs) for a full list of possible methods.

Keep us posted on the cool stuff you are doing by sending an email to <support@6px.io>. If you come across any issues or have suggestions please [open an issue on GitHub](https://github.com/6px-io/6px-node/issues).
