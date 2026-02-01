import { createSlice } from '@reduxjs/toolkit';

const initialPinnedTableState = { table: [] };

const pinnedTableSlice = createSlice({
  name: 'pinnedTable',
  initialState: initialPinnedTableState,
  reducers: {
    setPinnedTable(state, action) {
      state.table = action.payload
    },
  },
});

export const pinnedTableActions = pinnedTableSlice.actions;

export default pinnedTableSlice.reducer;