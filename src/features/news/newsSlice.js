import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import NewsService from '../../Services/NewsService';
import getSpanishError from '../../Components/Utils/HttpErrors';

import Alert from '../../Components/Utils/Alert';

const initialState = {
  newsList: [],
  loading: false,
  success: false,
  error: null,
};

export const fetchNewsList = createAsyncThunk(
  'news/get',

  async (id, { rejectWithValue }) => {
    try {
      const response = await NewsService.getNews(id);
      return response.data.data;
    } catch (error) {
      const errorMessage = getSpanishError(error.message);
      return rejectWithValue(errorMessage || error.message);
    }
  },
);

export const createNews = createAsyncThunk(
  'news/create',

  async (news, { rejectWithValue }) => {
    try {
      const response = await NewsService.create(news);
      return response.data.data;
    } catch (error) {
      const errorMessage = getSpanishError(error.message);
      return rejectWithValue(errorMessage || error.message);
    }
  },
);

export const updateNews = createAsyncThunk('news/update', async (news, { rejectWithValue }) => {
  try {
    const response = await NewsService.update(news);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const deleteNews = createAsyncThunk(
  'news/delete',

  async (id, { rejectWithValue }) => {
    try {
      const response = await NewsService.remove(id);
      if (response.data.success) {
        return id;
      }
    } catch (error) {
      const errorMessage = getSpanishError(error.message);
      return rejectWithValue(errorMessage);
    }
  },
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchNewsList.pending]: (state) => {
      state.loading = true;
      state.success = false;
    },

    [fetchNewsList.fulfilled]: (state, { payload }) => {
      state.newsList = payload;
      state.loading = false;
      state.success = true;
      state.error = null;
    },

    [fetchNewsList.rejected]: (state, { payload }) => {
      state.error = payload;
      state.success = false;
      state.loading = false;
    },

    [createNews.pending]: (state) => {
      state.loading = true;
    },

    [createNews.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.success = true;
      state.error = null;
      state.newsList = [...state.newsList, payload];
    },

    [createNews.rejected]: (state, { payload }) => {
      state.loading = false;
      state.success = false;
      state.error = payload;
    },

    [updateNews.pending]: (state) => {
      state.loading = true;
    },

    [updateNews.fulfilled]: (state, { payload }) => {
      const index = state.newsList.findIndex((news) => news.id === payload.id);

      const updatedNews = { ...state.newsList[index], ...payload };

      state.loading = false;
      state.success = true;
      state.error = null;
      state.newsList = [
        ...state.newsList.slice(0, index),
        updatedNews,
        ...state.newsList.slice(index + 1),
      ];
    },

    [updateNews.rejected]: (state, { error }) => {
      state.loading = false;
      state.success = false;
      state.error = error;
    },

    [deleteNews.pending]: (state) => {
      state.loading = true;
      state.success = false;
    },

    [deleteNews.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.success = true;
      state.error = null;
      state.newsList = state.newsList.filter((news) => news.id !== payload);
    },

    [deleteNews.rejected]: (state, { error }) => {
      state.loading = false;
      state.success = false;
      state.error = error;
    },
  },
});

export default newsSlice.reducer;
