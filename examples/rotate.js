var px = require('../.')({
    userId: '***API_KEY***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

px.on('connection', function() {

    var image = px({
        taxi: './images/unsplash_city_taxi.jpg'
    });

    image.output({ taxi: false })
        .rotate({
            degrees: 40
        })
        .url('6px')
        .tag('rotated');

    image.save().then(function(res) {
        console.log('Done:', res);
    }, function(err) {
        console.log('Error:', err);
    });

});
