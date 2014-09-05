var px = require('../.')();

px.on('connection', function() {

    console.log('Connected');

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
        .crop({
            x: 100,
            y: 100,
            width: 400,
            height: 400
        })
        .url('6px')
        .tag('cropped');


    image.save().then(function(res) {
        console.log(res.getOutput('cropped').getLocation('taxi'));
    }, function(err) {
        console.log(err);
    });

});
