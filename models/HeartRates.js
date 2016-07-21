/**
 * Created by Nithin on 4/11/16.
 */

var mongoose = require('mongoose');

var HeartRateSchema = new mongoose.Schema({
    timeStamp: 			String,
    date: 				String,
    time: 				String,
    uuid: 				String,
    heartRate: 			String,
    user: 				String,
    created_at: 		{type: Date, default_date: Date.now}
	// publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
});

mongoose.model('HeartRate', HeartRateSchema);