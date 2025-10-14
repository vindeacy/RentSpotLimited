import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/financial',
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
  tagTypes: ['Transaction', 'RentCollection', 'Expense', 'Report'],
  endpoints: (builder) => ({
    // Transactions
    getTransactions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.type) searchParams.append('type', params.type);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.property) searchParams.append('property', params.property);
        return `?${searchParams.toString()}`;
      },
      providesTags: ['Transaction'],
    }),
    createTransaction: builder.mutation({
      query: (transactionData) => ({
        url: '',
        method: 'POST',
        body: transactionData,
      }),
      invalidatesTags: ['Transaction', 'RentCollection', 'Expense'],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Transaction'],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transaction'],
    }),

    // Rent Collection
    getRentCollections: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.property) searchParams.append('property', params.property);
        if (params.month) searchParams.append('month', params.month);
        return `/rent-collection?${searchParams.toString()}`;
      },
      providesTags: ['RentCollection'],
    }),
    updateRentStatus: builder.mutation({
      query: ({ id, status, paymentDate, paymentMethod }) => ({
        url: `/rent-collection/${id}`,
        method: 'PUT',
        body: { status, paymentDate, paymentMethod },
      }),
      invalidatesTags: ['RentCollection', 'Transaction'],
    }),

    // Expenses
    getExpenses: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.category) searchParams.append('category', params.category);
        if (params.property) searchParams.append('property', params.property);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        return `/expenses?${searchParams.toString()}`;
      },
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation({
      query: (expenseData) => ({
        url: '/expenses',
        method: 'POST',
        body: expenseData,
      }),
      invalidatesTags: ['Expense', 'Transaction'],
    }),

    // Financial Reports
    getFinancialSummary: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.year) searchParams.append('year', params.year);
        if (params.month) searchParams.append('month', params.month);
        return `/summary?${searchParams.toString()}`;
      },
      providesTags: ['Report'],
    }),
    generateReport: builder.mutation({
      query: (reportParams) => ({
        url: '/generate-report',
        method: 'POST',
        body: reportParams,
      }),
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetRentCollectionsQuery,
  useUpdateRentStatusMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetFinancialSummaryQuery,
  useGenerateReportMutation,
} = financialApi;
