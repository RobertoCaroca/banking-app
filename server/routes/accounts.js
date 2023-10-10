const express = require('express');
const User = require('../models/user');
const generateAccountNumber = require('../utils/generateAccountNumber');
const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/create-credit/:userId', asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);
  const newAccountNumber = await generateAccountNumber();

  const newAccount = {
    accountNumber: newAccountNumber,
    accountType: 'credit',
    balance: 0,
    transactions: []
  };

  user.accounts.push(newAccount);
  await user.save();

  res.status(201).json(newAccount);
}));

router.put('/modify-credit/:userId/:accountId', asyncHandler(async (req, res) => {
    const { userId, accountId } = req.params;
    const { newCreditLimit } = req.body;

    const user = await User.findById(userId);
    const account = user.accounts.id(accountId);

    if (account.accountType !== 'credit') {
        return res.status(400).json({ error: 'Not a credit account!' });
    }

    account.balance = newCreditLimit; // Or some logic to adjust credit limit
    await user.save();

    res.status(200).json({ message: 'Credit adjusted!', account });
}));

router.get('/details/:userId/:accountId', asyncHandler(async (req, res) => {
  const { userId, accountId } = req.params;
  const user = await User.findById(userId);
  const account = user.accounts.id(accountId);
  res.status(200).json(account);
}));

router.get('/list/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.status(200).json(user.accounts);
}));

router.delete('/:userId/:accountId', asyncHandler(async (req, res) => {
  const { userId, accountId } = req.params;
  const user = await User.findById(userId);
  const account = user.accounts.id(accountId);

  account.remove();
  await user.save();

  res.status(200).json({ message: 'Account deleted successfully!' });
}));

module.exports = router;
