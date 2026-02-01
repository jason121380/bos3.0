import { configureStore } from '@reduxjs/toolkit';
import socketReducer from './socket';
import reservationReducer from './reservation';
import deductionDisplayReducer from './deductionDisplay';
import QRcodeClockInReducer from './QRcodeClockIn';
import pinnedTableReducer from './pinnedTable';

const store = configureStore({
  reducer: {
    socket: socketReducer,
    reservation: reservationReducer,
    deductionDisplay: deductionDisplayReducer,
    QRcodeClockIn: QRcodeClockInReducer,
    pinnedTable: pinnedTableReducer
  },
});

export default store;
