var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var async = require('async');

// mongoose.connect('mongodb://localhost/HealthMG2');
mongoose.connect('mongodb://nithin:nithin@ds031618.mlab.com:31618/health_mg');
// username: nithinreddy
// password: HealthMG7!

require('./models/DistancesStats');
require('./models/CaloriesStats');
require('./models/StepCountsStats');
require('./models/HeartRatesMinStats');
require('./models/HeartRatesMaxStats');
require('./models/Distances');
require('./models/Calories');
require('./models/StepCounts');
require('./models/HeartRates');
require('./models/Users');
require('./models/Subscriptions');
require('./models/ChatMessages');
require('./models/Conversations');

require('./config/passport');

var routes = require('./routes/index');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err.stack)
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;


