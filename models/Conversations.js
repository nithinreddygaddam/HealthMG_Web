var mongoose = require('mongoose');

var ConversationsSchema = mongoose.Schema({
  created_at: 		{type: Date, default_date: Date.now},
  users: 			[{type: String}]
});

mongoose.model('Conversation', ConversationsSchema);