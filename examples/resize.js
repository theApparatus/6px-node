var px = require('../.')({
    userId: '***API_KEY***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

var image = px({
    taxi: './images/unsplash_city_taxi.jpg'
});

image.output({ taxi: false })
    .resize({
        width: 250,
    })
    .url('6px');

image.save(function(err, res) {
    console.log(res);
});
