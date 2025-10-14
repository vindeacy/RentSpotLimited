// ...existing code...

// Import routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import maintenanceRoutes from './routes/maintenance.js';
import publicPropertyRoutes from './routes/publicProperties.js';

// ...existing code...

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes); // Protected routes
app.use('/api/public/properties', publicPropertyRoutes); // Public routes
app.use('/api/maintenance', maintenanceRoutes);

// ...existing code...