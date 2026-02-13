import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import dotenv from 'dotenv';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import tenantRoute from './routes/tenantRoute.js';
import landlordRoute from './routes/landlordRoute.js';
import propertyRoute from './routes/propertyRoute.js'; 
import propertyImageRoute from './routes/propertyImageRoute.js';
import publicProperties from './routes/publicProperties.js';
import applicationRoute from './routes/applicationRoute.js';
import leaseRoute from './routes/leaseRoute.js';
import analyticRoute from './routes/analyticRoute.js'; 
import dashboardRoute from './routes/dashboardRoute.js';
import activitylogRoute from './routes/activitylogRoute.js';
import notificationRoute from './routes/notificationRoutes.js';
import reviewRoute from './routes/reviewRoute.js';
import taxreturnRoute from './routes/taxreturnRoute.js';
import invoiceRoute from './routes/invoiceRoute.js';
import expenseRoute from './routes/expenseRoute.js';
import messageRoute from './routes/messageRoute.js';
import paymentRoutes from './routes/paymentRoutes.js';
import tenantProfileRoutes from './routes/tenantProfileRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import documentRoute from './routes/documentRoute.js'; 
dotenv.config();
const app = express();

// CORS configuration for cookies 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/tenants', tenantRoute);
app.use('/api/landlords', landlordRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/property-images', propertyImageRoute);
app.use('/api/public/properties', publicProperties);
app.use('/api/applications', applicationRoute);
app.use('/api/leases', leaseRoute);
app.use('/api/messages', messageRoute);
app.use('/api/payments', paymentRoutes);
app.use('/api/tenant-profile', tenantProfileRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/analytics', analyticRoute); 
app.use('/api/dashboard', dashboardRoute);
app.use('/api/activity-logs', activitylogRoute);
app.use('/api/notifications', notificationRoute); 
app.use('/api/reviews', reviewRoute);
app.use('/api/tax-returns', taxreturnRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/expenses', expenseRoute);
app.use('/api/documents', documentRoute); 

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});