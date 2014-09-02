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
        .resize({
            width: 250,
        })
        .url('6px')
        .tag('resized');

    image.save().then(function(res) {
        console.log('Success:', res);
    }, function(err) {
        console.log('Error:', err)
    });

});
