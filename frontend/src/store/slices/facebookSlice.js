import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { facebookAPI } from '../../services/api';

const initialState = {
  accounts: [],
  pages: [],
  adAccounts: [],
  groups: [],
  loginUrl: null,
  loading: false,
  error: null,
};

export const getLoginUrl = createAsyncThunk(
  'facebook/getLoginUrl',
  async (_, { rejectWithValue }) => {
    try {
      const response = await facebookAPI.getLoginUrl();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get login URL');
    }
  }
);

export const getAccounts = createAsyncThunk(
  'facebook/getAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await facebookAPI.getAccounts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get accounts');
    }
  }
);

export const connectMock = createAsyncThunk(
  'facebook/connectMock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await facebookAPI.connectMock();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to connect mock account');
    }
  }
);

export const connectToken = createAsyncThunk(
  'facebook/connectToken',
  async (data, { rejectWithValue }) => {
    try {
      const response = await facebookAPI.connectToken(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to connect account by token');
    }
  }
);

export const getPages = createAsyncThunk(
  'facebook/getPages',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await facebookAPI.getPages(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get pages');
    }
  }
);

export const getAdAccounts = createAsyncThunk(
  'facebook/getAdAccounts',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await facebookAPI.getAdAccounts(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get ad accounts');
    }
  }
);

export const getGroups = createAsyncThunk(
  'facebook/getGroups',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await facebookAPI.getGroups(accountId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get groups');
    }
  }
);

export const disconnectAccount = createAsyncThunk(
  'facebook/disconnectAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      await facebookAPI.disconnectAccount(accountId);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to disconnect account');
    }
  }
);

const facebookSlice = createSlice({
  name: 'facebook',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPages: (state) => {
      state.pages = [];
    },
    clearAdAccounts: (state) => {
      state.adAccounts = [];
    },
    clearGroups: (state) => {
      state.groups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Login URL
      .addCase(getLoginUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoginUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.loginUrl = action.payload.loginUrl;
      })
      .addCase(getLoginUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Accounts
      .addCase(getAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.accounts;
      })
      .addCase(getAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Connect Mock
      .addCase(connectMock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectMock.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.account) {
          const existingIndex = state.accounts.findIndex(a => a.id === action.payload.account.id);
          if (existingIndex >= 0) {
            state.accounts[existingIndex] = action.payload.account;
          } else {
            state.accounts.unshift(action.payload.account);
          }
        }
      })
      .addCase(connectMock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Connect Token
      .addCase(connectToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectToken.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.account) {
          const existingIndex = state.accounts.findIndex(a => a.id === action.payload.account.id);
          if (existingIndex >= 0) {
            state.accounts[existingIndex] = action.payload.account;
          } else {
            state.accounts.unshift(action.payload.account);
          }
        }
      })
      .addCase(connectToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Pages
      .addCase(getPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload.pages;
      })
      .addCase(getPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Ad Accounts
      .addCase(getAdAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.adAccounts = action.payload.adAccounts;
      })
      .addCase(getAdAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Groups
      .addCase(getGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.groups;
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Disconnect Account
      .addCase(disconnectAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(a => a.id !== action.payload);
      })
      .addCase(disconnectAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPages, clearAdAccounts, clearGroups } = facebookSlice.actions;
export default facebookSlice.reducer;
