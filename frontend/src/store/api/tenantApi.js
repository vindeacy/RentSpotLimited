import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/tenants',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const tenantApi = createApi({
  reducerPath: 'tenantApi',
  baseQuery,
  tagTypes: ['Tenant', 'Application', 'Lease'],
  endpoints: (builder) => ({
    // Tenant Management
    getTenants: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);
        if (params.property) searchParams.append('property', params.property);
        return `?${searchParams.toString()}`;
      },
      providesTags: ['Tenant'],
    }),
    getTenantById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tenant', id }],
    }),
    createTenant: builder.mutation({
      query: (tenantData) => ({
        url: '',
        method: 'POST',
        body: tenantData,
      }),
      invalidatesTags: ['Tenant'],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tenant', id }],
    }),
    deleteTenant: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenant'],
    }),

    // Tenant Applications
    getApplications: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.property) searchParams.append('property', params.property);
        return `/applications?${searchParams.toString()}`;
      },
      providesTags: ['Application'],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/applications/${id}/status`,
        method: 'PUT',
        body: { status, notes },
      }),
      invalidatesTags: ['Application'],
    }),

    // Lease Management
    getLeases: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.tenant) searchParams.append('tenant', params.tenant);
        return `/leases?${searchParams.toString()}`;
      },
      providesTags: ['Lease'],
    }),
    createLease: builder.mutation({
      query: (leaseData) => ({
        url: '/leases',
        method: 'POST',
        body: leaseData,
      }),
      invalidatesTags: ['Lease', 'Tenant'],
    }),
    updateLease: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/leases/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lease', id }],
    }),

    // Communication
    sendMessage: builder.mutation({
      query: ({ tenantId, message }) => ({
        url: `/${tenantId}/messages`,
        method: 'POST',
        body: { message },
      }),
    }),
    getMessages: builder.query({
      query: (tenantId) => `/${tenantId}/messages`,
    }),

    // Background Checks
    requestBackgroundCheck: builder.mutation({
      query: ({ tenantId, checkType }) => ({
        url: `/${tenantId}/background-check`,
        method: 'POST',
        body: { checkType },
      }),
    }),
    getBackgroundCheck: builder.query({
      query: (tenantId) => `/${tenantId}/background-check`,
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetLeasesQuery,
  useCreateLeaseMutation,
  useUpdateLeaseMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useRequestBackgroundCheckMutation,
  useGetBackgroundCheckQuery,
} = tenantApi;
