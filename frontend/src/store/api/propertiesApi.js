import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query for authenticated requests
const authenticatedBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/properties',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query for public requests (no auth required)
const publicBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/public/properties',
});

export const propertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Property'],
  endpoints: (builder) => ({
    // Public endpoints (no authentication required)
    getPublicProperties: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.query) searchParams.append('query', params.query);
        if (params.city) searchParams.append('city', params.city);
        if (params.country) searchParams.append('country', params.country);
        if (params.type) searchParams.append('type', params.type);
        if (params.minPrice) searchParams.append('minPrice', params.minPrice);
        if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice);
        if (params.limit) searchParams.append('limit', params.limit);
        
        return `?${searchParams.toString()}`;
      },
      queryFn: async (params, api, extraOptions, baseQuery) => {
        return publicBaseQuery(
          typeof params === 'string' ? params : `?${new URLSearchParams(params).toString()}`,
          api,
          extraOptions
        );
      },
      providesTags: ['Property'],
    }),
    getFeaturedProperties: builder.query({
      query: (limit = 3) => `?featured=true&limit=${limit}`,
      queryFn: async (limit, api, extraOptions, baseQuery) => {
        return publicBaseQuery(
          `?featured=true&limit=${limit}`,
          api,
          extraOptions
        );
      },
      providesTags: ['Property'],
    }),
    getPublicPropertyById: builder.query({
      query: (id) => `/${id}`,
      queryFn: async (id, api, extraOptions, baseQuery) => {
        return publicBaseQuery(`/${id}`, api, extraOptions);
      },
      providesTags: (result, error, id) => [{ type: 'Property', id }],
    }),
    
    // Authenticated endpoints (require authentication)
    getProperties: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.query) searchParams.append('query', params.query);
        if (params.city) searchParams.append('city', params.city);
        if (params.country) searchParams.append('country', params.country);
        if (params.type) searchParams.append('type', params.type);
        if (params.minPrice) searchParams.append('minPrice', params.minPrice);
        if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice);
        if (params.limit) searchParams.append('limit', params.limit);
        
        return `?${searchParams.toString()}`;
      },
      providesTags: ['Property'],
    }),
    getPropertyById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Property', id }],
    }),
    createProperty: builder.mutation({
      query: (propertyData) => ({
        url: '',
        method: 'POST',
        body: propertyData,
      }),
      invalidatesTags: ['Property'],
    }),
    updateProperty: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Property', id }],
    }),
    deleteProperty: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Property'],
    }),
  }),
});

export const {
  // Public endpoints
  useGetPublicPropertiesQuery,
  useGetFeaturedPropertiesQuery,
  useGetPublicPropertyByIdQuery,
  
  // Authenticated endpoints
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertiesApi;
