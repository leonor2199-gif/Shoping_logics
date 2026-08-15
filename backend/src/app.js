const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { env } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { apiLimiter } = require('./middleware/rateLimiter');
const { authRouter } = require('./routes/authRoutes');
const { healthRouter } = require('./routes/healthRoutes');
const { productRouter } = require('./routes/productRoutes');
const { orderRouter } = require('./routes/orderRoutes');
const { financeRouter } = require('./routes/financeRoutes');
const { bankConfigRouter } = require('./routes/bankConfigRoutes');
const { adminRouter } = require('./routes/adminRoutes');
const { userRouter } = require('./routes/userRoutes');
const { vipLevelRouter } = require('./routes/vipLevelRoutes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.trustProxy);

app.use((req, res, next) => {
  if (env.nodeEnv === 'production' && env.enforceHttps && !req.secure) {
    return res.redirect(308, `https://${req.get('host')}${req.originalUrl}`);
  }
  return next();
});

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use('/api', apiLimiter);
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/finance', financeRouter);
app.use('/api/config/banks', bankConfigRouter);
app.use('/api/admin', adminRouter);
app.use('/api/vip-levels', vipLevelRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
