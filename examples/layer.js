var px = require('../.')({
    userId: '53570317ed81710200aa471e',
    apiKey: '0284e6a8b711cf89ae0897040029b34b',
    apiSecret: '1039ebfde3d76eff6aeaea0e87fcf987'
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
