var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var passport = require('passport');
var async = require('async');
var http = require('http').Server(express);
var io = require('socket.io')(http);
var socketioJwt   = require("socketio-jwt");

var users = {};

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});


var mongoose = require('mongoose');
var User = mongoose.model('User');
var HeartRate = mongoose.model('HeartRate');
var Subscription = mongoose.model('Subscription');
var StepCount = mongoose.model('StepCount');
var Calories = mongoose.model('Calories');
var Distance = mongoose.model('Distance');
var Conversation = mongoose.model('Conversation');
var ChatMessage = mongoose.model('ChatMessage');
var HeartRateMinStats = mongoose.model('HeartRateMinStats');
var HeartRateMaxStats = mongoose.model('HeartRateMaxStats');
var StepCountStats = mongoose.model('StepCountStats');
var CaloriesStats = mongoose.model('CaloriesStats');
var DistanceStats = mongoose.model('DistanceStats');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


http.listen(8100, function(){
    console.log('Listening on *:8100');
});

// Socket code for interacting with the mobile app
io.use(socketioJwt.authorize({
  secret: 'SECRET',
  handshake: true
}));

io.on('connection', function(clientSocket){

    clientSocket.emit("connected");

// username is ID here
    clientSocket.on('newUser', function (username) {
        if (!(username in users)) {
            console.log('a user connected: ' + username);
            clientSocket.username = username;
            users[clientSocket.username] = clientSocket;
        }

        
    });

    clientSocket.on('disconnect', function(){
        console.log('user disconnected: ' + clientSocket.username);
        delete users[clientSocket.username];
    });


    clientSocket.on("getLatestRecords", function (username) {
        var timeStamp0 = " "
        var timeStamp1 = " "
        var timeStamp2 = " "
        var timeStamp3 = " "
        console.log("Getting latest records");
        var q = StepCountStats.find({user: username}).limit(1).sort({timeStamp: -1});
        q.exec(function(err, latestRecord) {
            if (err) {
                console.log(err);
            }
            console.log(latestRecord)

            if(latestRecord.length > 0){
                timeStamp0 = latestRecord.timeStamp
            }   

            var q2 = DistanceStats.find({user: username}).limit(1).sort({timeStamp: -1});
            q2.exec(function(err, latestRecord2) {
                if (err) {
                    console.log(err);
                }
            
                console.log(latestRecord2.timeStamp)

                if(latestRecord.length > 0){
                    timeStamp1 = latestRecord2.timeStamp
                }
                
                console.log(timeStamp1)

                var q3 = CaloriesStats.find({user: username}).limit(1).sort({timeStamp: -1});
                q3.exec(function(err, latestRecord3) {
                    if (err) {
                        console.log(err);
                    }
                   

                    if(latestRecord.length > 0){
                        timeStamp2 = latestRecord3.timeStamp
                    }

                    var q4 = HeartRateMinStats.find({user: username}).limit(1).sort({timeStamp: -1});
                    q4.exec(function(err, latestRecord4) {
                        if (err) {
                            console.log(err);
                        }

                        if(latestRecord.length > 0){
                            timeStamp3 = latestRecord4.timeStamp 
                        }
                        

                        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<latest records----------------------------------");
                        console.log(timeStamp1)

                        clientSocket.emit("successLatestRecords", timeStamp0, timeStamp1, timeStamp2, timeStamp3 );    

                    });
                });
            });    
        });
    });


clientSocket.on('sendUpdates', function(steps, distances, calories, hrMins, hrMaxs){

    console.log(steps)
    console.log(distances)
    console.log(calories)


    

    steps.forEach( function(step) {

        var stepC = new StepCountStats();
        stepC.timeStamp = step["timeStamp"];
        stepC.weekDay = step.weekDay;
        stepC.day = step.day;
        stepC.month = step.month;
        stepC.year = step.year;
        stepC.value = step.value;
        stepC.user = step.user;
        stepC.save(function (err){
            if(err){ console.log(err);}

        });

    });

    
    distances.forEach( function(dist) {

        var distance = new DistanceStats();

        distance.timeStamp = dist.timeStamp;
        distance.weekDay = dist.weekDay;
        distance.day = dist.day;
        distance.month = dist.month;
        distance.year = dist.year;
        distance.value = dist.value;
        distance.user = dist.user;
        distance.save(function (err){
            if(err){ console.log(err);}

        });
    });


    
    calories.forEach( function(calorie) {

        var cal = new CaloriesStats();

        cal.timeStamp = calorie.timeStamp;
        cal.weekDay = calorie.weekDay;
        cal.day = calorie.day;
        cal.month = calorie.month;
        cal.year = calorie.year;
        cal.value = calorie.value;
        cal.user = calorie.user;
        cal.save(function (err){
            if(err){ console.log(err);}

        });
    });


    
    hrMaxs.forEach( function(hr) {

        var hrsMax = new HeartRateMaxStats();

        hrsMax.timeStamp = hr.timeStamp;
        hrsMax.weekDay = hr.weekDay;
        hrsMax.day = hr.day;
        hrsMax.month = hr.month;
        hrsMax.year = hr.year;
        hrsMax.value = hr.value;
        hrsMax.user = hr.user;
        hrsMax.save(function (err){
            if(err){ console.log(err);}

        });
    });


    
    hrMins.forEach( function(hr) {

        var hrsMin = new HeartRateMinStats();

        hrsMin.timeStamp = hr.timeStamp;
        hrsMin.weekDay = hr.weekDay;
        hrsMin.day = hr.day;
        hrsMin.month = hr.month;
        hrsMin.year = hr.year;
        hrsMin.value = hr.value;
        hrsMin.user = hr.user;
        hrsMin.save(function (err){
            if(err){ console.log(err);}

        });
    });
});


    clientSocket.on('requestSubscription', function(_id, username){

        var subscription = new Subscription();

        User.findOne({username: username}, function (err, user) {
            if (err) { 
                 console.log('error finding user');
                console.log(err); }
            if (!user) { return next(new Error("can't find user")); }
            subscription.publisher = user._id;
            subscription.subscriber = _id;
            subscription.active = 'PENDING';
            console.log(user._id);
            console.log("Subscription: " + subscription);

            subscription.save(function(err,subscription) {
                if(err) {
                    console.log(err);
                } else {
                    console.log('request saved');
                    clientSocket.emit("successRequesting", user);
                }
            });
        });
    });


    clientSocket.on('getPublishersList', function(userID){

        var arrPublishers = [];
        var itemsProcessed = 0;

        console.log("Getting publishers");
        console.log(userID);
        //plubisher here is a general user

        var q = Subscription.find({subscriber: userID});
        q.exec(function (err, subscriptions) {
            if (err) {
                console.log("error finding publishers");
                console.log(err);
            }
            else{
                if(subscriptions.length === 0){
                    clientSocket.emit("successPubList", arrPublishers);
                }
                console.log("Found publishers");
                console.log(subscriptions);
                subscriptions.forEach( function(subscription) {
                if(subscription.subscriber == userID){
                        var query = User.findById(subscription.publisher);
                        query.exec(function (err, user) {
                            if (err) {
                                console.log(err);
                            }
                            if (!user) {
                                console.log(err);
                            }
                            arrPublishers.push(user); 
                            itemsProcessed ++;

                            if( itemsProcessed == subscriptions.length){
                                console.log("Publishers");
                                console.log(arrPublishers);
                               clientSocket.emit("successPubList", arrPublishers);
                            }

                        });

                }

                });

                
            }
            
            });
    });


    clientSocket.on('getSubscribersList', function(userID){

        var arrSubscribers = [];
        var itemsProcessed = 0;

        console.log("Getting subscribers");
        console.log(userID);
        //plubisher here is a general user

        var q = Subscription.find({publisher: userID});
        q.exec(function (err, subscriptions) {
            if (err) {
                console.log("error finding publishers");
              console.log(err);
            }
            else{
                if(subscriptions.length === 0){
                    clientSocket.emit("successPubList", arrSubscribers);
                }
                console.log("Found subscribers");
                console.log(subscriptions);
                subscriptions.forEach( function(subscription) {
                if(subscription.publisher == userID){
                        var query = User.findById(subscription.subscriber);
                        query.exec(function (err, user) {
                            if (err) {
                                console.log(err);
                            }
                            if (!user) {
                                console.log("can't find user");
                            }
                            arrSubscribers.push(user); 
                            itemsProcessed ++;

                            if( itemsProcessed == subscriptions.length){
                                console.log("Suscribers");
                                console.log(arrSubscribers);
                               clientSocket.emit("successSubList", arrSubscribers);
                            }

                        });

                }

                });
                
            }
            
            });
    });


    clientSocket.on('getSubscribtion', function(userID, subscriberID){

        Subscription.findOne({publisher: userID, subscriber: subscriberID}, function (err, subscribtion) {
            if (err) { 
                console.log(err);
            }
                console.log("User subscribtions");
                console.log(subscribtion);
                clientSocket.emit("successSubscribtion", subscribtion);

        });
    });

    clientSocket.on('changePermission', function(subscribtion){
        console.log(subscribtion);
        if(subscribtion.heartRate == true || subscribtion.distance == true || subscribtion.calories == true || subscribtion.stepCount == true)
        {
            subscribtion.status = 'ACTIVE'
        }
        if(subscribtion.heartRate == false && subscribtion.distance == false && subscribtion.calories == false && subscribtion.stepCount == false)
        {
            subscribtion.status = 'PENDING'
        }
        var query = {'publisher':subscribtion.publisher, 'subscriber':subscribtion.subscriber};
        Subscription.findOneAndUpdate(query, subscribtion, function(err, doc){
        if (err) {console.log(err);}
        console.log("succesfully saved permissions");
        });
    });


    clientSocket.on('getConversationID', function(user1, user2){

        Conversation.find({ 'users' : { $all : [ user1, user2 ]}}, function (err, conversation) {
            if (err) { 
                console.log(err);
            }
                console.log("Conversation");
                console.log(conversation);
                clientSocket.emit("successConversationID", conversation);

        });
    });


    clientSocket.on('getChatMessages', function(conversationID){
        console.log(conversationID);
        if (conversationID){
            var q = ChatMessage.find({conversation: mongoose.Types.ObjectId(conversationID)}).sort({created_at: 1})
            q.exec(function (err, chat) {
                if (err) {
                    console.log(err); 
                }
                console.log("Chat Messages");
                console.log(chat);
                clientSocket.emit("successChatMessages", chat);
            });
        }
        else{
            clientSocket.emit("successChatMessages", null);
        }
    });

    clientSocket.on('chatMessage', function(conversationID, loggedUser, user2, message){
        
        var currentDateTime = new Date().toLocaleString();

        console.log(conversationID);
        if (!conversationID){
                var conversation = new Conversation();
                conversation.users = [loggedUser, user2];
                conversation.created_at = currentDateTime
                conversation.save(function (err, conv) {
                if(err){ console.log(err); }
                    console.log('Conversation saved');
                    console.log(conv);

                    var chatMessage = new ChatMessage();
                    chatMessage.created_at = currentDateTime;
                    chatMessage.text = message;
                    chatMessage.from = loggedUser;
                    chatMessage.conversation = conv;

                    chatMessage.save(function (err) {
                        if(err){ console.log(err); }
                            console.log('Message saved');
                            users[loggedUser].emit('newChatMessage', loggedUser, message, currentDateTime, conv._id.toString());
                            if(user2 in users){
                                users[user2].emit('newChatMessage', loggedUser, message, currentDateTime, conv._id.toString());
                            }
                        });

                    });
        }
        else{
            var chatMessage = new ChatMessage();
            chatMessage.created_at = currentDateTime;
            chatMessage.text = message;
            chatMessage.from = loggedUser;
            chatMessage.conversation = mongoose.Types.ObjectId(conversationID);

            chatMessage.save(function (err) {
                if(err){ console.log(err); }
                console.log('Message saved')
                users[loggedUser].emit('newChatMessage', loggedUser, message, currentDateTime, conversationID);
                if(user2 in users){
                    users[user2].emit('newChatMessage', loggedUser, message, currentDateTime, conversationID);
                }
            });
        }
    });



    clientSocket.on('getConversationsList', function(userID){

        Conversation.find({ 'users' : { $in : [userID]}}, function (err, conversations) {
            if (err) { 
                console.log(err);
            }
            console.log(conversations);
            var itemsProcessed = 0;
            var arrConvo = [];
            var userProf = [];

            conversations.forEach( function(convo) {

                if(convo.users[0] != userID){
                    var query = User.findById(convo.users[0]);
                    query.exec(function (err, user) {
                        if (err) {
                            console.log(err);
                        }
                        if (!user) {
                            console.log("can't find user");
                        }

                        // var q = ChatMessage.findOne({'conversation': convo}).sort({created_at: -1});
                        // q.exec(function (err, message){
                            
                        //     if (err){
                        //         console.log(err);
                        //     }

                            var conv = {
                                id: convo._id.toString(),
                                name: user.firstName + " " + user.lastName,
                                user: user,
                                // text: message.text,
                                text: " ",
                                // created_at: message.created_at
                                created_at: " "
                            };
                
                            console.log("123");
                            console.log(conv);
                            arrConvo.push(conv);
                            itemsProcessed++;
                            console.log(itemsProcessed);
                            console.log(conversations.length);
                            if( itemsProcessed == conversations.length){
                                console.log("popping array");
                                console.log(arrConvo);
                                clientSocket.emit("successConversationsList", JSON.parse(JSON.stringify(arrConvo)));
                            }
                        // });
                    });
                }
                else{
                    var query = User.findById(convo.users[1]);
                    query.exec(function (err, user2) {
                        if (err) {
                            console.log(err);
                        }
                        if (!user2) {
                            console.log("can't find user");
                        }
                        // userProf = user;

                        // var q = ChatMessage.findOne({'conversation': convo}).sort({created_at: -1});
                        // q.exec(function (err, message){
                        //     if (err){
                        //         console.log(err);
                        //     }
                            var conv = {
                                id: convo._id.toString(),
                                name: user2.firstName + " " + user2.lastName,
                                user: user2,
                                // text: message.text,
                                text: " ",
                                // created_at: message.created_at
                                created_at: " "
                            };
                    
                            console.log("123");
                            console.log(conv);
                            arrConvo.push(conv);

                            itemsProcessed++;
                            console.log(itemsProcessed);
                            console.log(conversations.length);
                            if( itemsProcessed == conversations.length){
                                console.log("popping array");
                                console.log(arrConvo);
                                clientSocket.emit("successConversationsList", arrConvo);
                            }
                        // });
                    });
                }
            });
        });
    });

        //delete chat by conversation ID
    clientSocket.on('deleteChat', function(conversationID){
        console.log("deleting")
        console.log(conversationID)
        console.log(mongoose.Types.ObjectId(conversationID))
        Conversation.remove({"_id": mongoose.Types.ObjectId(conversationID)}, function (err) {
        if (err) return handleError(err);
            console.log("deleted conversation")
        });
        ChatMessage.remove({"conversation": conversationID}, function (err) {
        if (err) return handleError(err);
            console.log("deleted chat messages")
        });
    });


    clientSocket.on('deleteSubscibtion', function(userID, user2ID){

        Subscription.remove({"publisher": userID, "subscriber": user2ID}, function (err) {
        if (err) return handleError(err); 
            console.log("deleted subscription");

            Conversation.remove({ 'users' : { $all : [ userID, user2ID ]}}, function (err) {
            if (err) return handleError(err);
                console.log("deleted conversation")
            });
            ChatMessage.remove({"conversation": conversationID}, function (err) {
            if (err) return handleError(err);
                console.log("deleted chat messages")
            });
        });
    });


    //save heart rate to database
    clientSocket.on('heartRate', function(timeStamp, date, time, hr, uuid, user){
        var heartR = new HeartRate();
        console.log("Got heart Rate");

        heartR.timeStamp = timeStamp;
        heartR.time = time;
        heartR.date = date;
        heartR.heartRate = hr;
        heartR.uuid = uuid;
        heartR.user = user;
        heartR.save(function (err){
            if(err){ console.log(err); }

        });
    });

    //save step counts to database
    clientSocket.on('stepCount', function(timeStamp, date, time, count, uuid, user){
        var stepC = new StepCount();

        console.log("Got steps");

        stepC.timeStamp = timeStamp;
        stepC.time = time;
        stepC.date = date;
        stepC.count = count;
        stepC.uuid = uuid;
        stepC.user = user;
        stepC.save(function (err){
            if(err){ console.log(err);}

        });
    });

    //save distance to database
    clientSocket.on('distance', function(timeStamp, date, time, val, uuid, user){
        var distance = new Distance();

        console.log("Got Distance");

        distance.timeStamp = timeStamp;
        distance.time = time;
        distance.date = date;
        distance.distance = val;
        distance.uuid = uuid;
        distance.user = user;
        distance.save(function (err){
            if(err){ console.log(err); }

        });
    });

    //save calories to database
    clientSocket.on('calories', function(timeStamp, date, time, val, uuid, user){
        var calories = new Calories();

        console.log("Got calories");

        calories.timeStamp = timeStamp;
        calories.time = time;
        calories.date = date;
        calories.calories = val;
        calories.uuid = uuid;
        calories.user = user;
        calories.save(function (err){
            if(err){ console.log(err); }

        });
    });

    clientSocket.on('getHeartRates', function(user){

 var emptyFlag = 0;
        console.log("Getting heart Rates");
        console.log(user._id);

        var q = HeartRate.find({user: user._id, date: "05/11"}).sort({timeStamp: -1});
        q.exec(function(err, latestRecords) {
        if (err) {
            console.log(err);
        }
        if (latestRecords.length === 0){
            emptyFlag = 1;
            console.log("Heart rate data empty for user")
        }
        // console.log(latestRecords);
        clientSocket.emit("successHeartRates", latestRecords, emptyFlag);        
        });
    });


  });



router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return res.status(401).json({message :'Wrong Credentials entered'});
                
            }
            if (user) {
                return res.json({token: user.generateJWT(), user: user});
                
            } else {
                return res.status(401).json({message :'Error logging in'});
            }
        })(req, res, next);
});


router.post('/register', function(req, res, next){
    console.log("registering");
    if(!req.body.username || !req.body.password || !req.body.firstName || !req.body.lastName ){
        return res.status(400).json({message :'Please fill out all fields'});
    }
        var user = new User();

        user.username = req.body.username;
        user.setPassword(req.body.password);
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.gender = req.body.gender;
        user.dateOfBirth = req.body.dob;

        user.save(function (err) {
            if (err) {
                return next(err);
            }
            return res.json({token: user.generateJWT(), user: user})
        });

});


router.get('/publisher/:username', function(req, res, next) {
    var query = User.findOne({'username': req.params.username});
    query.exec(function (err, user){
        if (err) { return next(err); }
        if (!user) { return next(new Error("can't find usr")); }
        res.send(user);

    });
});


router.get('/subscriptions', function(req, res, next) {
    console.log("get all");
    var arrPublishers = [];
    var itemsProcessed = 0;


    Subscription.find(function(err, subscriptions) {
        if (err) {
            return next(err);
        }
        subscriptions.forEach( function(subscription) {

            var query = Publisher.findById(subscription.publisher);
            query.exec(function (err, publisher) {
                if (err) {
                    return next(err);
                }
                if (!publisher) {
                    return next(new Error("can't find publisher"));
                }
                arrPublishers.push(publisher); 
                itemsProcessed ++;

                if( itemsProcessed == subscriptions.length){
                    res.json(arrPublishers);
                }

            });

        });

    });


});

router.post('/subscriptions', auth, function(req, res, next) {

    var subscription = new Subscription(req.body);

    console.log(subscription);

    var query = Subscriber.findById(req.body.subscriber);
    var publisherObject;

    query.exec(function (err, subscriber) {
        if (err) {
            return next(err);
        }
        if (!subscriber) {
            return next(new Error("can't find subscriber"));
        }
        subscription.subscriber = subscriber;
        console.log(subscriber._id);
    });

    var query2 = Publisher.findById(req.body.publisher);

    query2.exec(function (err, publisher){
        if (err) { return next(err); }
        if (!publisher) { return next(new Error("can't find publisher")); }
        subscription.publisher = publisher;
        publisherObject = publisher;
        console.log(publisher._id);
    });

    console.log(subscription);

    subscription.save(function(err,subscription) {
        if(err) {
            console.log(err);
            res.send({
                message :'something went wrong'
            });
        } else {
            console.log('saved subscription');
            // subscription.publisherUsername = publisherUsername;
            // console.log(subscription);
            res.json(publisherObject);
        }

    });

});


module.exports = router;
