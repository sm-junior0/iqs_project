const express = require('express');
const cors = require('cors');


const app = express();

// Swagger UI setup
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const evaluatorRoutes = require('./routes/evaluatorRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const fileRoutes = require('./routes/fileRoutes');

const errorHandler = require('./middleware/errorMiddleware');

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/evaluator', evaluatorRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/message', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminDashboardRoutes'));
app.use('/api/evaluator', require('./routes/evaluatorDashboardRoutes'));
app.use('/api/school', require('./routes/schoolDashboardRoutes'));
app.use('/api/trainer', require('./routes/trainerDashboardRoutes'));

app.use(errorHandler);

module.exports = app;

