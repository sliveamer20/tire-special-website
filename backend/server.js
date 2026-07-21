const express = require('express');
const cors = require('cors');
const env = require('./src/config/env');
const healthRoutes = require('./src/routes/health');
const tiresRoutes = require('./src/routes/tires');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors({ origin: env.allowedOrigin }));
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api', tiresRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Backend server running on port ${env.port} (${env.nodeEnv})`);
});
