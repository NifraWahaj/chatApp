const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'}
});

module.exports = mongoose.model('ChatRequest', chatRequestSchema);