const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const router = express.Router();
const admin = require('../firebase');
const { authenticateToken, setCustomUserRole, checkRoleConsistency, checkUserOrAdminAccess, isAdmin} = require('../middlewares/auth');

const asyncHandler = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @swagger
 * /users/all:
 *  get:
 *    description: Retrieve all users.
 *    responses:
 *      '200':
 *        description: A successful response containing all users.
 *      '401':
 *        description: Unauthorized.
 */

router.get('/all', authenticateToken, isAdmin, asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
}));

/**
 * @swagger
 * /users/create-in-db:
 *  post:
 *    description: Create a user in the database.
 *    parameters:
 *      - name: firebaseUserId
 *        description: Firebase UID of the user.
 *        in: formData
 *        required: true
 *      - name: email
 *        description: Email of the user.
 *        in: formData
 *        required: true
 *      - name: name
 *        description: Name of the user.
 *        in: formData
 *        required: true
 *    responses:
 *      '201':
 *        description: User created successfully.
 *      '400':
 *        description: User already exists in the database.
 *      '500':
 *        description: Failed to set custom claim.
 */

router.post('/create-in-db', asyncHandler(async (req, res) => {
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
 
/**
 * @swagger
 * /users/set-role:
 *  post:
 *    description: Set the role of a user.
 *    parameters:
 *      - name: firebaseUserId
 *        description: Firebase UID of the user.
 *        in: formData
 *        required: true
 *      - name: role
 *        description: Role of the user. Either 'admin' or 'customer'.
 *        in: formData
 *        required: true
 *    responses:
 *      '200':
 *        description: Role updated successfully.
 *      '400':
 *        description: Invalid role type.
 *      '500':
 *        description: Failed to set custom claim.
 */

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

/**
 * @swagger
 * /users/update-profile/{_id}:
 *  put:
 *    description: Update the profile of a user.
 *    parameters:
 *      - name: _id
 *        description: MongoDB ID of the user.
 *        in: path
 *        required: true
 *      - name: name
 *        description: Updated name of the user.
 *        in: formData
 *        required: true
 *      - name: email
 *        description: Updated email of the user.
 *        in: formData
 *        required: true
 *    responses:
 *      '200':
 *        description: User profile updated successfully.
 *      '401':
 *        description: Unauthorized.
 */

router.put('/update-profile/:_id', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    const _id = req.params._id;
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(_id, { name, email }, { new: true });
    res.status(200).json(user);
}));

/**
 * @swagger
 * /users/search-users:
 *  get:
 *    description: Search users based on a term.
 *    parameters:
 *      - name: term
 *        description: Search term to find users.
 *        in: query
 *        required: true
 *      - name: excludeUserId
 *        description: ID of the user to exclude from the search results.
 *        in: query
 *        required: false
 *    responses:
 *      '200':
 *        description: Successful response with matched users.
 *      '401':
 *        description: Unauthorized.
 */

router.get('/search-users', authenticateToken, asyncHandler(async (req, res) => {
    const searchTerm = req.query.term;
    const excludeUserId = req.query.excludeUserId;
    
    const extractedTerm = searchTerm.split('@')[0];
    
    const regexSearchTerm = new RegExp("^" + extractedTerm, 'i');
    
    const users = await User.find({
        $text: { $search: searchTerm },
        _id: { $ne: excludeUserId }
    });

    const responseUsers = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        savingsAccountNumber: user.accounts.find(account => account.accountType === 'savings')?.accountNumber
    }));

    res.status(200).json(responseUsers);
}));

/**
 * @swagger
 * /users/{_id}:
 *  delete:
 *    description: Delete a user based on their ID.
 *    parameters:
 *      - name: _id
 *        description: MongoDB ID of the user to delete.
 *        in: path
 *        required: true
 *    responses:
 *      '200':
 *        description: User deleted successfully.
 *      '401':
 *        description: Unauthorized.
 */

router.delete('/:_id', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const user = await User.findByIdAndDelete(_id);
    res.status(200).json(user);
}));

/**
 * @swagger
 * /users/profile/{_id}:
 *  get:
 *    description: Retrieve the profile of a user based on their ID.
 *    parameters:
 *      - name: _id
 *        description: MongoDB ID of the user.
 *        in: path
 *        required: true
 *    responses:
 *      '200':
 *        description: Successful response with user profile.
 *      '401':
 *        description: Unauthorized.
 */

router.get('/profile/:_id', authenticateToken, asyncHandler(async (req, res) => {
    const _id = req.params._id;
    const user = await User.findById(_id).select('-password');
    res.status(200).json(user);
}));

/**
 * @swagger
 * /users/update-password/{_id}:
 *  put:
 *    description: Update the password of a user.
 *    parameters:
 *      - name: _id
 *        description: MongoDB ID of the user.
 *        in: path
 *        required: true
 *      - name: oldPassword
 *        description: Current password of the user.
 *        in: formData
 *        required: true
 *      - name: newPassword
 *        description: New password for the user.
 *        in: formData
 *        required: true
 *    responses:
 *      '200':
 *        description: Password updated successfully.
 *      '400':
 *        description: Old password is incorrect.
 *      '401':
 *        description: Unauthorized.
 */

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

/**
 * @swagger
 * /users/details-by-firebase-id/{firebaseUserId}:
 *  get:
 *    description: Retrieve user details based on their Firebase UID.
 *    parameters:
 *      - name: firebaseUserId
 *        description: Firebase UID of the user.
 *        in: path
 *        required: true
 *    responses:
 *      '200':
 *        description: Successful response with user details.
 *      '401':
 *        description: Unauthorized.
 */

router.get('/details-by-firebase-id/:firebaseUserId', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    const { firebaseUserId } = req.params;
    const user = await User.findOne({ firebaseUserId });
    res.status(200).json(user);
}));

/**
 * @swagger
 * /users/details/{_id}:
 *  get:
 *    description: Retrieve details of a user based on their MongoDB ID.
 *    parameters:
 *      - name: _id
 *        description: MongoDB ID of the user.
 *        in: path
 *        required: true
 *    responses:
 *      '200':
 *        description: Successful response with user details.
 *      '404':
 *        description: User not found.
 *      '401':
 *        description: Unauthorized.
 */

router.get('/details/:_id', authenticateToken, checkRoleConsistency, checkUserOrAdminAccess, asyncHandler(async (req, res) => {
    console.log("Inside /details/:_id endpoint");

    const targetUser = await User.findById(_id).populate('accounts.transactions');

    if(!targetUser) {
        console.log("User not found with ID:", _id);
        return res.status(404).json({ error: 'User not found!' });
    }

    console.log("User found and responding with data for ID:", _id);
    res.status(200).json({
        target: targetUser,  // details of the user being requested
        requester: requesterUser  // details of the user making the request
    });

    // Fetching details of the user making the request
    const requesterUser = await User.findOne({ firebaseUserId: req.user._id });

    if(!requesterUser) {
        console.log("Requester user not found with ID:", req.user._id);
        return res.status(404).json({ error: 'Requester user not found!' });
    }

    const { _id } = req.params;
    console.log("Fetching user with ID:", _id);
    res.status(200).json({
        target: targetUser,  // details of the user being requested
        requester: requesterUser  // details of the user making the request
    });
}));

module.exports = router;
