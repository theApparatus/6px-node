var px = require('../.')({
    userId: '***USER_ID***',
    apiKey: '***API_KEY***',
    apiSecret: '***API_SECRET***'
});

var image = px({
    taxi: './images/unsplash_city_taxi.jpg',
    logo: 'http://6px.io/img/px-logo-md@2x.png'
});

image.output({ taxi: false })
    .layer('logo', {
        opacity: 0.8
    })
    .url('6px')
    .tag('watermarked');

image.save(function(err, res) {
    console.log(res);
});
