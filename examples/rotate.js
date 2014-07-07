var px = require('../.')({
    userId: '***API_KEY***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

var image = px({
    taxi: './images/unsplash_city_taxi.jpg'
});

image.output({ taxi: false })
    .rotate({
        degrees: 40
    })
    .url('6px')
    .tag('rotated');

image.save(function(err, res) {
    console.log(res);
});
