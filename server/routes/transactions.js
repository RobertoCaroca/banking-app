const express = require('express');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/deposit/:userId/:accountId', asyncHandler(async (req, res) => {
  const { userId, accountId } = req.params;
  const { amount } = req.body;

  const user = await User.findById(userId);
  const account = user.accounts.id(accountId);

  account.balance += Number(amount);
  const transaction = new Transaction({
    type: 'deposit',
    amount: Number(amount),
    balanceAfter: account.balance,
    relatedAccount: account._id
  });

  await transaction.save();
  account.transactions.push(transaction);
  await user.save();

  res.status(201).json(transaction);
}));

router.post('/withdraw/:userId/:accountId', asyncHandler(async (req, res) => {
  const { userId, accountId } = req.params;
  const { amount } = req.body;

  const user = await User.findById(userId);
  const account = user.accounts.id(accountId);

  account.balance -= Number(amount);
  const transaction = new Transaction({
    type: 'withdraw',
    amount: Number(amount),
    balanceAfter: account.balance,
    relatedAccount: accountId
  });

  await transaction.save();
  account.transactions.push(transaction);
  await user.save();

  res.status(201).json(transaction);
}));

router.post('/transfer/:fromUserId/:fromAccountId', asyncHandler(async (req, res) => {
  const { fromUserId, fromAccountId } = req.params;
  const { toAccountNumber, amount } = req.body;

  const fromUser = await User.findById(fromUserId);
  const fromAccount = fromUser.accounts.id(fromAccountId);
  const toUser = await User.findOne({ "accounts.accountNumber": toAccountNumber });

  if (!toUser) {
      return res.status(400).json({ error: 'Recipient not found!' });
  }

  const toAccount = toUser.accounts.find(account => account.accountNumber === toAccountNumber);

  if (fromAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds!' });
  }

  fromAccount.balance -= Number(amount);
  toAccount.balance += Number(amount);

  const transactionSender = new Transaction({
      type: 'transfer-out',
      amount: Number(amount),
      balanceAfter: fromAccount.balance,
      relatedAccount: fromAccountId,
      recipientAccount: toAccountNumber
  });
  const transactionRecipient = new Transaction({
      type: 'transfer-in',
      amount: Number(amount),
      balanceAfter: toAccount.balance,
      relatedAccount: toAccount._id,
      recipientAccount: fromAccount.accountNumber
  });

  await transactionSender.save();
  await transactionRecipient.save();

  fromAccount.transactions.push(transactionSender);
  toAccount.transactions.push(transactionRecipient);
  await fromUser.save();
  await toUser.save();

  res.status(201).json({ transactionSender, transactionRecipient });
}));

router.get('/:userId/:accountId', asyncHandler(async (req, res) => {
  const { userId, accountId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
      return res.status(404).json({ error: 'User not found!' });
  }

  const account = user.accounts.id(accountId);
  if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
  }

  // Fetch transactions associated with the account.
  const transactions = await Transaction.find({ relatedAccount: accountId });

  res.status(200).json(transactions);
}));

module.exports = router;
