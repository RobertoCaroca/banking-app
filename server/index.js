const express = require('express');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const accountRoutes = require('./routes/accounts');
const { isAdmin, isCustomer } = require('./middlewares/authorization');

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

// Simulating authentication middleware to populate req.user. 
// In a real-world scenario, you'd verify a token and get the user's details.
app.use((req, res, next) => {
    // This is just a mock. Typically, you'd fetch user details based on a token.
    req.user = {
        _id: "sampleId123",
        role: "customer", // This can be 'admin' or 'customer' based on the user's actual role
        email: "sample@email.com",
        name: "Sample User"
    };
    next();
});

app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

// For routes that require admin privileges
// I'm just demonstrating. You might want to structure actual admin routes differently.
app.use('/admin', isAdmin, accountRoutes);

// For routes that require customer privileges
// This is just for demonstration. Structure it based on your actual needs.
app.use('/customer', isCustomer, transactionRoutes);

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
});
