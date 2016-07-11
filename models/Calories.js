var mongoose = require('mongoose');

var CaloriesSchema = new mongoose.Schema({
    timeStamp: String,
    date: String,
    time: String,
    uuid: String,
    calories: String,
    user: String
	// publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
});

mongoose.model('Calories', CaloriesSchema);