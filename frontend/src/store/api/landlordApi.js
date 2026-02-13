import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/landlord`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const landlordApi = createApi({
  reducerPath: 'landlordApi',
  baseQuery,
  tagTypes: ['DashboardStats', 'Analytics'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/dashboard-stats',
      providesTags: ['DashboardStats'],
    }),
    getAnalytics: builder.query({
      query: ({ range, year }) => `/analytics?range=${range}&year=${year}`,
      providesTags: ['Analytics'],
    }),
    exportReport: builder.mutation({
      query: (reportData) => ({
        url: '/export-report',
        method: 'POST',
        body: reportData,
      }),
    }),
    getContractors: builder.query({
      query: () => '/contractors',
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAnalyticsQuery,
  useExportReportMutation,
  useGetContractorsQuery,
} = landlordApi;
