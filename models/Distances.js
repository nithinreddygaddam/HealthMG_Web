var mongoose = require('mongoose');

var DistanceSchema = new mongoose.Schema({
    timeStamp: String,
    date: String,
    time: String,
    uuid: String,
    distance: String,
    user: String
	// publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
});

mongoose.model('Distance', DistanceSchema);