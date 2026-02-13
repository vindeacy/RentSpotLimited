import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Centralized API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const maintenanceApi = createApi({
  reducerPath: 'maintenanceApi',
  baseQuery: fetchBaseQuery({
    // We stop at /api so we can reuse this if we ever merge APIs later
    baseUrl: `${API_URL}/api`, 
    prepareHeaders: (headers, { getState }) => {
      // Logic to grab the token from Redux state OR LocalStorage
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MaintenanceRequest'],
  endpoints: (builder) => ({
    // 1. Get all maintenance requests
    getMaintenanceRequests: builder.query({
      query: () => '/maintenance',
      providesTags: ['MaintenanceRequest'],
    }),

    // 2. Create a new request (The one used in your Maintenance.jsx)
    createMaintenanceRequest: builder.mutation({
      query: (requestData) => ({
        url: '/maintenance',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),

    // 3. Update status (e.g., from 'Open' to 'In Progress')
    updateMaintenanceStatus: builder.mutation({
      query: ({ id, status, landlordNotes }) => ({
        url: `/maintenance/${id}/status`,
        method: 'PUT',
        body: { status, landlordNotes },
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),

    // 4. Assign a contractor to the job
    assignContractor: builder.mutation({
      query: ({ id, contractorId }) => ({
        url: `/maintenance/${id}/assign`,
        method: 'PUT',
        body: { contractorId },
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),

    // 5. Add an expense (cost) to the maintenance job
    addExpense: builder.mutation({
      query: ({ id, expenseData }) => ({
        url: `/maintenance/${id}/expenses`,
        method: 'POST',
        body: expenseData,
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),
  }),
});
export const {
  useGetMaintenanceRequestsQuery,
  useCreateMaintenanceRequestMutation,
  useUpdateMaintenanceStatusMutation,
  useAssignContractorMutation,
  useAddExpenseMutation,
} = maintenanceApi;