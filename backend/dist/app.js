import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
const app = express();
app.use(cors({
    origin: '*', // Allow all for demo purposes
    credentials: true
}));
app.use(express.json());
// Routes
app.use('/', authRoutes);
app.use('/employees', employeeRoutes);
// Base route health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// Error handling middleware (log server errors and return JSON)
app.use((err, req, res, next) => {
    console.error('[Server Error]: Unhandled exception', err.stack || err.message || err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
export default app;
