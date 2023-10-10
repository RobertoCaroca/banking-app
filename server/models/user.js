const mongoose = require('mongoose');
const generateAccountNumber = require('../utils/generateAccountNumber');

const AccountSchema = new mongoose.Schema({
  accountNumber: { type: String, unique: true, required: true },
  accountType: { type: String, enum: ['savings', 'credit'] },
  balance: Number,
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  firebaseUserId: { type: String, unique: true },
  role: { type: String, default: 'customer' },
  accounts: [AccountSchema]
});

UserSchema.index({ name: 'text', email: 'text' });

UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    const accountNumber = await generateAccountNumber(this.constructor);
    this.accounts.push({
      accountNumber,
      accountType: 'savings',
      balance: 0,
      transactions: []
    });
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
