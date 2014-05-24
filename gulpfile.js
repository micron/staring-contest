var gulp = require('gulp');
var plumber = require('gulp-plumber');
var connect = require('connect');
var http = require('http');
var devApp = connect();

gulp.task('server', function(callback){
    devApp.use(connect.static('web/'));

    var server = http.createServer(devApp).listen(8000, '0.0.0.0');
    server.on('listening', function(){
        var devAddress = server.address(),
            devHost = devAddress === '0.0.0.0' ? 'localhost' : devAddress.address,
            url = 'http://' + devHost + ':' + devAddress.port;

        console.log('Started webserver at ' + url);
        callback();
    });
})

gulp.task('default', ['server']);
