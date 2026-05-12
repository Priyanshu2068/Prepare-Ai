const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['OOPS', 'DBMS', 'OS', 'CN', 'Java'],
    required: true
  },
  name: { type: String, required: true },
  topicIndex: { type: Number, required: true }
});

module.exports = mongoose.model('Topic', topicSchema);