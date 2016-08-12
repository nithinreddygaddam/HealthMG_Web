var mongoose = require('mongoose');

var StepCountStatsSchema = new mongoose.Schema({
    timeStamp: 			String,
    weekDay: 			String,
    day:                String,
    month:              String,
    year: 				String,
    value: 				String,
    user: 				String,
    created_at: 		{type: Date, default_date: Date.now}
	// publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
});

mongoose.model('StepCountStats', StepCountStatsSchema);