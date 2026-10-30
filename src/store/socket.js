import { createSlice } from '@reduxjs/toolkit'

const initialSocketState = { schedule: null }

const socketSlice = createSlice({
  name: 'schedule',
  initialState: initialSocketState,
  reducers: {
    setSchedule(state, action) {
      state.schedule = action.payload
    },
  },
})

export const socketActions = socketSlice.actions

export default socketSlice.reducer
