import { createSlice } from '@reduxjs/toolkit';

const initialQRcodeClockIn= { key: null };

const QRcodeClockInSlice = createSlice({
  name: 'QRcodeClockIn',
  initialState: initialQRcodeClockIn,
  reducers: {
    setQRcodeKey(state, action) {
      state.key = action.payload
    },
  },
});

export const QRcodeClockInActions = QRcodeClockInSlice.actions;

export default QRcodeClockInSlice.reducer;