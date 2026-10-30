import { createSlice } from '@reduxjs/toolkit'

const initialSocketState = { reservationData: null }

const reservationSlice = createSlice({
  name: 'reservation',
  initialState: initialSocketState,
  reducers: {
    setReservation(state, action) {
      state.reservationData = action.payload
    },
  },
})

export const reservationActions = reservationSlice.actions

export default reservationSlice.reducer
