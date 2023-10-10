const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  balanceAfter: Number,
  relatedAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientAccount: String
});

module.exports = mongoose.model('Transaction', TransactionSchema);
