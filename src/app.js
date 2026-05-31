const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const tenantsRouter = require('./routes/tenants');
const menusRouter = require('./routes/menus');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'eatsy' });
});

app.use('/api/tenants', tenantsRouter);
app.use('/api/menus', menusRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
