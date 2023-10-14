// middlewares/auth.js
const User = require('../models/user');
const admin = require('../firebase');

async function authenticateToken(req, res, next) {
    console.log("Inside authenticateToken middleware");

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const token = req.headers.authorization.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            _id: decodedToken.uid,
            role: decodedToken.role || "customer",
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email
        };
        next();
    } catch (err) {
        console.error('Error verifying token ', err);
        res.status(403).json({ error: 'Unauthorized' });
    }
}

async function setCustomUserRole(userId, userRole) {
    try {
      await admin.auth().setCustomUserClaims(userId, { role: userRole });
    } catch (error) {
      console.error('Error setting custom user claims', error);
      throw error; // This will ensure that any route using this function is aware of any errors.
    }
  }

const checkRoleConsistency = async (req, res, next) => {
    console.log("Inside checkRoleConsistency middleware");

    const firebaseUserId = req.user._id;  // Get this from the decoded token
    const tokenRole = req.user.role;      // Get this from the decoded token

    const dbUser = await User.findOne({ firebaseUserId: firebaseUserId });
    if (!dbUser) {
        return res.status(404).json({ error: 'User not found in the database.' });
    }

    // If role in token is different from role in the database
    if (dbUser.role !== tokenRole) {
        // Update the custom claim in Firebase
        await setCustomUserRole(firebaseUserId, dbUser.role);

        // Revoke all tokens for this user
        await admin.auth().revokeRefreshTokens(firebaseUserId);

        // Generate a new token with the updated claims
        const newToken = await admin.auth().createCustomToken(firebaseUserId, { role: dbUser.role });

        // Send back the new token to the client
        return res.status(200).json({
            message: 'Token refreshed due to role change.',
            newToken: newToken
        });
    }

    next();
};

const checkUserOrAdminAccess = async (req, res, next) => {
    console.log("Inside checkUserOrAdminAccess middleware");

    const userIdFromToken = req.user._id;  // ID from decoded token
    const userIdFromParam = req.params._id || req.params.firebaseUserId;  // ID from route params

    const targetUserId = req.query.targetUserId || userIdFromParam;

    // If it's the user's own record, the user is an admin, or the request is for another user's details by an admin, allow
    if (userIdFromToken === targetUserId || req.user.role === 'admin' || (req.user.role === 'admin' && targetUserId)) {
        return next();
    }

    // If not, deny access
    return res.status(403).json({ error: 'Permission denied!' });
};


// Check if user is an Admin Middleware
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied!' });
    }
    next();
}

// Check if user is a Customer Middleware
function isCustomer(req, res, next) {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ error: 'Permission denied!' });
    }
    next();
}

module.exports = {
    authenticateToken,
    setCustomUserRole,
    checkRoleConsistency,
    checkUserOrAdminAccess,
    isAdmin,
    isCustomer
};
