import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { maintenanceApi } from './api/maintenanceApi';
import { landlordApi } from './api/landlordApi';
import { propertiesApi } from './api/propertiesApi';
import { tenantApi } from './api/tenantApi';
import { financialApi } from './api/financialApi';
import { userApi } from './api/userApi';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
    [landlordApi.reducerPath]: landlordApi.reducer,
    [propertiesApi.reducerPath]: propertiesApi.reducer,
    [tenantApi.reducerPath]: tenantApi.reducer,
    [financialApi.reducerPath]: financialApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      maintenanceApi.middleware,
      landlordApi.middleware,
      propertiesApi.middleware,
      tenantApi.middleware,
      financialApi.middleware,
      userApi.middleware
    ),
});
