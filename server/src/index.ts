import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import animalRoutes from './routes/animals';
import appointmentRoutes from './routes/appointments';
import vaccinationRoutes from './routes/vaccinations';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check (placeholder - will be implemented in future changes)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'VetClinic Pro API is running' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;