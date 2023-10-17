const express = require('express');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const accountRoutes = require('./routes/accounts');
const { authenticateToken, isAdmin, isCustomer } = require('./middlewares/auth');
const app = express();

app.use(express.json());
app.use(cors());

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello from Banking App!');
});

app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

app.use('/admin', authenticateToken, isAdmin, accountRoutes);
app.use('/customer', authenticateToken, isCustomer, transactionRoutes);

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
