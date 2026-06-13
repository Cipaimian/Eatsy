const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const authRouter    = require('./routes/auth');
const tenantsRouter = require('./routes/tenants');
const menusRouter = require('./routes/menus');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const feedbackRouter = require('./routes/feedback');
const historyRouter = require('./routes/history');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'eatsy' });
});

app.use('/api/auth',    authRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/history', historyRouter);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
