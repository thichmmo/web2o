import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postAPI } from '../../services/api';

const initialState = {
  posts: [],
  currentPost: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const createPost = createAsyncThunk(
  'post/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await postAPI.createPost(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

export const getPosts = createAsyncThunk(
  'post/getPosts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await postAPI.getPosts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get posts');
    }
  }
);

export const getPost = createAsyncThunk(
  'post/getPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postAPI.getPost(postId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get post');
    }
  }
);

export const publishPost = createAsyncThunk(
  'post/publishPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postAPI.publishPost(postId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to publish post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'post/updatePost',
  async ({ postId, formData }, { rejectWithValue }) => {
    try {
      const response = await postAPI.updatePost(postId, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update post');
    }
  }
);

export const retryPost = createAsyncThunk(
  'post/retryPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postAPI.retryPost(postId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to retry post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await postAPI.deletePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete post');
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Posts
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Post
      .addCase(getPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload.post;
      })
      .addCase(getPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Publish Post
      .addCase(publishPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishPost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex(p => p.id === action.payload.post.id);
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost?.id === action.payload.post.id) {
          state.currentPost = action.payload.post;
        }
      })
      .addCase(publishPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex(p => p.id === action.payload.post.id);
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        state.currentPost = action.payload.post;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Retry Post
      .addCase(retryPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryPost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex(p => p.id === action.payload.post.id);
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost?.id === action.payload.post.id) {
          state.currentPost = action.payload.post;
        }
      })
      .addCase(retryPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(p => p.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer;
