import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const tenantApi = createApi({
  reducerPath: 'tenantApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`, // Standardized with your other APIs
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Tenant', 'Application', 'Lease'],
  endpoints: (builder) => ({
    // TENANT ENDPOINTS
    getTenants: builder.query({
      query: (params) => ({ url: '/tenants', params }),
      providesTags: ['Tenant'],
    }),
    getTenantById: builder.query({
      query: (id) => `/tenants/${id}`,
      providesTags: ['Tenant'],
    }),
    createTenant: builder.mutation({
      query: (tenantData) => ({
        url: '/tenants',
        method: 'POST',
        body: tenantData,
      }),
      invalidatesTags: ['Tenant'],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tenants/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Tenant'],
    }),

    // PROFILE ENDPOINTS
    getTenantProfile: builder.query({
      query: (id) => `/tenant-profile/${id}`,
      providesTags: ['Tenant'],
    }),
    updateTenantProfile: builder.mutation({
      query: ({ id, ...profileData }) => ({
        url: `/tenant-profile/${id}`,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Tenant'],
    }),

    // APPLICATION ENDPOINTS
    getApplications: builder.query({
      query: (params) => ({ url: '/applications', params }),
      providesTags: ['Application'],
    }),
    getApplicationById: builder.query({
      query: (id) => `/applications/${id}`,
      providesTags: ['Application'],
    }),
    updateApplication: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/applications/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Application'],
    }),

    // LEASE ENDPOINTS
    getLeases: builder.query({
      query: (params) => ({ url: '/leases', params }),
      providesTags: ['Lease'],
    }),
    getLeaseById: builder.query({
      query: (id) => `/leases/${id}`,
      providesTags: ['Lease'],
    }),
    createLease: builder.mutation({
      query: (leaseData) => ({
        url: '/leases',
        method: 'POST',
        body: leaseData,
      }),
      invalidatesTags: ['Lease'],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useGetTenantProfileQuery,
  useUpdateTenantProfileMutation,
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationMutation,
  useGetLeasesQuery,
  useGetLeaseByIdQuery,
  useCreateLeaseMutation,
} = tenantApi;