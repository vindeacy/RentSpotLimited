import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  role: localStorage.getItem('role'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    },
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.role = role;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const { user, token, role } = action.payload;
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.role = role;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        const { user, token, role } = action.payload;
        if (token) {
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.role = role;
          localStorage.setItem('token', token);
          localStorage.setItem('role', role);
          localStorage.setItem('user', JSON.stringify(user));
        }
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
