/**
 * Created by Nithin on 4/11/16.
 */


var mongoose = require('mongoose');

var SubscriptionSchema = new mongoose.Schema({
    status:         { type: String, uppercase: true, enum: ['ACTIVE', 'PENDING'], default:'PENDING' },
    publisher:      { type: String },
    subscriber:     { type: String },
    heartRate:      { type: Boolean, default:false },
    distance:       { type: Boolean, default:false },
    stepCount:      { type: Boolean, default:false },
    calories:       { type: Boolean, default:false },
    created_at:     {type: Date, default_date: Date.now}
});

// SubscriptionSchema.pre('save', function(next){
//     now = new Date();
//     this.updated_at = now;
//     if ( !this.created_at ) {
//         this.created_at = now;
//     }
//     next();
// });

mongoose.model('Subscription', SubscriptionSchema);