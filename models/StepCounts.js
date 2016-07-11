var mongoose = require('mongoose');

var StepCountSchema = new mongoose.Schema({
    timeStamp: String,
    date: String,
    time: String,
    uuid: String,
    count: String,
    user: String
	// publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
});

mongoose.model('StepCount', StepCountSchema);