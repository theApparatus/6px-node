Node.js module for 6px
======================

Node.js module for interacting with the [6px API](http://6px.io). This module includes methods to make the process of sending images to 6px for processing easier.

## Getting Started

Install the NPM package:
```bash
$ npm install 6px
```

More examples can be found in the examples directory, but here's a sample of adding a watermark to an image:
```javascript
var px = require('6px')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

/**
 * Load our images
 *
 * It can be a path to a file on your machine.
 * It can be a buffer.
 * It can be a location on the internet.
 */
var image = px({
    taxi: './images/unsplash_city_taxi.jpg',
    logo: 'http://6px.io/img/px-logo-md@2x.png'
});

/**
 * Create a new output object.
 *
 * We need to tell that output which input we are working with.
 * In this case we will use the taxi as the main image.  We use an object, that way we can specify the filename that we want to use.  You do have the option of just putting `false` in there, and 6px will generate a name for you.
 */
var output = image.output({ taxi: 'unsplashed_6px_watermark' });

/**
 * We are now adding a layer action.  We are referring to the other input we defined earlier.
 *
 * Some options are opacity, x, y, width, height.
 */
output.layer('logo', {
    opacity: 0.6
});

// Where does the image end up?  Passing `6px` will send it to 6px's CDN.
output.url('6px');

// Every output needs a name
output.tag('watermarked');

/**
 * Send to 6px!  The result will be a response from the API with the ID.
 *
 * This doesn't mean the job is done.  This means the API has received the request.
 */
image.save(function(err, res) {
    console.log(res);
});
```

All of those methods are chainable, by the way:
```javascript
var px = require('6px')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

var image = px({
    taxi: './images/unsplash_city_taxi.jpg',
    logo: 'http://6px.io/img/px-logo-md@2x.png'
});

image.output({ taxi: 'unsplashed_6px_watermark' })
    .layer('logo', {
        opacity: 0.6
    })
    .tag('watermarked')
    .url('6px');

image.save(function(err, res) {
    console.log(res);
});
```
Granted, we lost the comments, but you can see most of the methods are set up to be chainable.
