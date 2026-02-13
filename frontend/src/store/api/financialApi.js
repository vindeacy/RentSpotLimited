import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const financialApi = createApi({
  reducerPath: 'financialApi',
  baseQuery,
  tagTypes: ['Payment', 'Financial', 'Transaction', 'Expense'],
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: () => '/payments',
      providesTags: ['Payment'],
    }),
    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
      providesTags: ['Payment'],
    }),
    createPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/payments',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment'],
    }),
    updatePayment: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/payments/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Payment'],
    }),
    getTransactions: builder.query({
      query: (params) => ({
        url: '/transactions',
        params,
      }),
      providesTags: ['Transaction'],
    }),
    getTransactionById: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: ['Transaction'],
    }),
    createTransaction: builder.mutation({
      query: (transactionData) => ({
        url: '/transactions',
        method: 'POST',
        body: transactionData,
      }),
      invalidatesTags: ['Transaction', 'Financial'],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Transaction'],
    }),
    getRentCollections: builder.query({
      query: (params) => ({
        url: '/rent-collections',
        params,
      }),
      providesTags: ['Payment'],
    }),
    getExpenses: builder.query({
      query: (params) => ({
        url: '/expenses',
        params,
      }),
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation({
      query: (expenseData) => ({
        url: '/expenses',
        method: 'POST',
        body: expenseData,
      }),
      invalidatesTags: ['Expense', 'Financial'],
    }),
    getFinancialSummary: builder.query({
      query: () => '/financial/summary',
      providesTags: ['Financial'],
    }),
    getFinancialReports: builder.query({
      query: ({ range, year }) => `/financial/reports?range=${range}&year=${year}`,
      providesTags: ['Financial'],
    }),
    exportFinancialReport: builder.mutation({
      query: (reportData) => ({
        url: '/financial/export',
        method: 'POST',
        body: reportData,
      }),
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useGetRentCollectionsQuery,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetFinancialSummaryQuery,
  useGetFinancialReportsQuery,
  useExportFinancialReportMutation,
} = financialApi;
