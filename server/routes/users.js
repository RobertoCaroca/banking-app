const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const router = express.Router();
const admin = require('../firebase');
const { authenticateToken, setCustomUserRole, checkRoleConsistency, checkUserOrAdminAccess, isAdmin} = require('../middlewares/auth');

const asyncHandler = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/all', authenticateToken, isAdmin, asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
}));

router.post('/create-in-db', authenticateToken, asyncHandler(async (req, res) => {
    const { firebaseUserId, email, name } = req.body;
  
    const existingUser = await User.findOne({ firebaseUserId });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists in the database!' });
    }
  
    const newUser = new User({ firebaseUserId, email, name, role: 'customer' });  // Set default role
    await newUser.save();
  
    // Set role as custom claim in Firebase
    await setCustomUserRole(firebaseUserId, 'customer');
  
    res.status(201).json(newUser);
  }));
 
  router.post('/set-role', authenticateToken, isAdmin, async (req, res) => {
    const { firebaseUserId, role } = req.body;

    if (!['admin', 'customer'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role type' });
    }

    try {
        // Set role as custom claim in Firebase
        await setCustomUserRole(firebaseUserId, role);

        // If the above operation was successful, update the role in MongoDB
        await User.findOneAndUpdate({ firebaseUserId: firebaseUserId }, { role: role });

        res.json({ message: `Role ${role} set for user with Firebase UID ${firebaseUserId}` });
    } catch (error) {
        console.log('Error setting custom claim', error);
        res.status(500).json({ error: 'Failed to set custom claim.' });
    }
});

router.put('/update-profile/:_id', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    const _id = req.params._id;
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(_id, { name, email }, { new: true });
    res.status(200).json(user);
}));

router.get('/search-users', authenticateToken, asyncHandler(async (req, res) => {
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

router.delete('/:_id', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const user = await User.findByIdAndDelete(_id);
    res.status(200).json(user);
}));

router.get('/profile/:_id', authenticateToken, asyncHandler(async (req, res) => {
    const _id = req.params._id;
    const user = await User.findById(_id).select('-password');
    res.status(200).json(user);
}));

router.put('/update-password/:_id', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
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

router.get('/details-by-firebase-id/:firebaseUserId', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    const { firebaseUserId } = req.params;
    const user = await User.findOne({ firebaseUserId });
    res.status(200).json(user);
}));

router.get('/details/:_id', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    console.log("Inside /details/:_id endpoint");

    const { _id } = req.params;
    console.log("Fetching user with ID:", _id);

    const targetUser = await User.findById(_id).populate('accounts.transactions');
    
    if(!targetUser) {
        console.log("User not found with ID:", _id);
        return res.status(404).json({ error: 'User not found!' });
    }

    // Fetching details of the user making the request
    const requesterUser = await User.findOne({ firebaseUserId: req.user._id });

    if(!requesterUser) {
        console.log("Requester user not found with ID:", req.user._id);
        return res.status(404).json({ error: 'Requester user not found!' });
    }

    console.log("User found and responding with data for ID:", _id);
    res.status(200).json({
        target: targetUser,  // details of the user being requested
        requester: requesterUser  // details of the user making the request
    });
}));

module.exports = router;
