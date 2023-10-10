const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/all', asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
}));

router.post('/create-in-db', asyncHandler(async (req, res) => {
  const { firebaseUserId, email, name } = req.body;

  const existingUser = await User.findOne({ firebaseUserId });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists in the database!' });
  }

  const newUser = new User({ firebaseUserId, email, name });
  await newUser.save();

  res.status(201).json(newUser);
}));

router.put('/update-profile/:_id', asyncHandler(async (req, res) => {
    const _id = req.params._id;
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(_id, { name, email }, { new: true });
    res.status(200).json(user);
}));

router.get('/search-users', asyncHandler(async (req, res) => {
  const searchTerm = req.query.term;
  const users = await User.find({ $text: { $search: searchTerm } });

  // Filter and shape the data to only return what's necessary
  const responseUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      savingsAccountNumber: user.accounts.find(account => account.accountType === 'savings')?.accountNumber
  }));

  res.status(200).json(responseUsers);
}));

router.delete('/:_id', asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const user = await User.findByIdAndDelete(_id);
    res.status(200).json(user);
}));

router.get('/profile/:_id', asyncHandler(async (req, res) => {
    const _id = req.params._id;
    const user = await User.findById(_id).select('-password');
    res.status(200).json(user);
}));

router.put('/update-password/:_id', asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(_id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect!' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Password updated successfully!' });
}));

router.get('/details-by-firebase-id/:firebaseUserId', asyncHandler(async (req, res) => {
    const { firebaseUserId } = req.params;
    const user = await User.findOne({ firebaseUserId });
    res.status(200).json(user);
}));

router.get('/details-by-id/:_id', asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const user = await User.findById(_id)
      .populate('accounts.transactions');
  
  if(!user) {
      return res.status(404).json({ error: 'User not found!' });
  }

  res.status(200).json(user);
}));

module.exports = router;
