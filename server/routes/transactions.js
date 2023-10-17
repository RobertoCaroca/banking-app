const express = require('express');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @swagger
 * /deposit/{userId}/{accountId}:
 *  post:
 *    description: Deposit a specified amount into an account.
 *    parameters:
 *      - name: userId
 *        description: MongoDB ID of the user.
 *        in: path
 *        required: true
 *      - name: accountId
 *        description: ID of the account.
 *        in: path
 *        required: true
 *      - name: amount
 *        description: Amount to deposit.
 *        in: formData
 *        required: true
 *    responses:
 *      '201':
 *        description: Deposit transaction was successful.
 *      '400':
 *        description: Input error or invalid data.
 *      '500':
 *        description: Server error.
 */

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

/**
 * @swagger
 * /withdraw/{userId}/{accountId}:
 *  post:
 *    description: Withdraw a specified amount from an account.
 *    parameters:
 *      - name: userId
 *        description: MongoDB ID of the user.
 *        in: path
 *        required: true
 *      - name: accountId
 *        description: ID of the account.
 *        in: path
 *        required: true
 *      - name: amount
 *        description: Amount to withdraw.
 *        in: formData
 *        required: true
 *    responses:
 *      '201':
 *        description: Withdrawal transaction was successful.
 *      '400':
 *        description: Input error, insufficient funds, or invalid data.
 *      '500':
 *        description: Server error.
 */

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

/**
 * @swagger
 * /transfer/{fromUserId}/{fromAccountId}:
 *  post:
 *    description: Transfer a specified amount from one account to another.
 *    parameters:
 *      - name: fromUserId
 *        description: MongoDB ID of the sender user.
 *        in: path
 *        required: true
 *      - name: fromAccountId
 *        description: ID of the sender account.
 *        in: path
 *        required: true
 *      - name: toAccountNumber
 *        description: Account number of the recipient.
 *        in: formData
 *        required: true
 *      - name: amount
 *        description: Amount to transfer.
 *        in: formData
 *        required: true
 *    responses:
 *      '201':
 *        description: Transfer was successful.
 *      '400':
 *        description: Input error, recipient not found, insufficient funds, or invalid data.
 *      '500':
 *        description: Server error.
 */

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

/**
 * @swagger
 * /{userId}/{accountId}:
 *  get:
 *    description: Retrieve transactions associated with an account.
 *    parameters:
 *      - name: userId
 *        description: MongoDB ID of the user.
 *        in: path
 *        required: true
 *      - name: accountId
 *        description: ID of the account.
 *        in: path
 *        required: true
 *    responses:
 *      '200':
 *        description: Successful response with list of transactions.
 *      '404':
 *        description: User or Account not found.
 *      '500':
 *        description: Server error.
 */

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
