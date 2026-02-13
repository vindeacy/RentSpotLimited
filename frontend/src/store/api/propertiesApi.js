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

export const propertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery,
  tagTypes: ['Property'],
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: () => '/properties',
      providesTags: ['Property'],
    }),
    getPropertyById: builder.query({
      query: (id) => `/properties/${id}`,
      providesTags: ['Property'],
    }),
    getPublicProperties: builder.query({
      query: (params) => ({
        url: '/public/properties',
        params,
      }),
      providesTags: ['Property'],
    }),
    getPublicPropertyById: builder.query({
      query: (id) => `/public/properties/${id}`,
      providesTags: ['Property'],
    }),
    getFeaturedProperties: builder.query({
      query: (limit) => `/public/properties?featured=true&limit=${limit}`,
      providesTags: ['Property'],
    }),
    createProperty: builder.mutation({
      query: (propertyData) => ({
        url: '/properties',
        method: 'POST',
        body: propertyData,
      }),
      invalidatesTags: ['Property'],
    }),
    updateProperty: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/properties/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Property'],
    }),
    deleteProperty: builder.mutation({
      query: (id) => ({
        url: `/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Property'],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useGetPublicPropertiesQuery,
  useGetPublicPropertyByIdQuery,
  useGetFeaturedPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertiesApi;
