import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/maintenance',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const maintenanceApi = createApi({
  reducerPath: 'maintenanceApi',
  baseQuery,
  tagTypes: ['MaintenanceRequest'],
  endpoints: (builder) => ({
    getMaintenanceRequests: builder.query({
      query: () => '',
      providesTags: ['MaintenanceRequest'],
    }),
    createMaintenanceRequest: builder.mutation({
      query: (requestData) => ({
        url: '',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),
    updateMaintenanceStatus: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),
    assignContractor: builder.mutation({
      query: ({ id, contractorId }) => ({
        url: `/${id}/assign`,
        method: 'PUT',
        body: { contractorId },
      }),
      invalidatesTags: ['MaintenanceRequest'],
    }),
    addExpense: builder.mutation({
      query: ({ id, expenseData }) => ({
        url: `/${id}/expenses`,
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
