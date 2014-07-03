var px = require('../.');

px.init({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

var image = px({
    taxi: './images/unsplash_city_taxi.jpg'
});

image.output({ taxi: false })
    .crop({
        x: 0,
        y: 0,
        width: 250,
        height: 250
    })
    .url('6px');

image.save(function(err, res) {
    console.log(res);
});
