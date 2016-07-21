var mongoose = require('mongoose');

var ChatMessagesSchema = mongoose.Schema({
  created_at: 		{type: Date, default_date: Date.now},
  text: 			String,
  from: 			String,
  conversation : 	{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }
});

mongoose.model('ChatMessage', ChatMessagesSchema);