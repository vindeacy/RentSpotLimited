import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Example route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});


import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import tenantRoute from './routes/tenantRoute.js';
import landlordRoute from './routes/landlordRoute.js';
import propertyRoute from './routes/propertyRoute.js';
import propertyImageRoute from './routes/propertyImageRoute.js';
import applicationRoute from './routes/applicationRoute.js';
import leaseRoute from './routes/leaseRoute.js';
import messageRoute from './routes/messageRoute.js';

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/tenants', tenantRoute);
app.use('/api/landlords', landlordRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/property-images', propertyImageRoute);
app.use('/api/applications', applicationRoute);
app.use('/api/leases', leaseRoute);
app.use('/api/messages', messageRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});