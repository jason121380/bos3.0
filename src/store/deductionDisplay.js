import { createSlice } from '@reduxjs/toolkit'

const initialDisplayState = { service: false, coupon: false }

const deductionDisplaySlice = createSlice({
  name: 'deductionDisplay',
  initialState: initialDisplayState,
  reducers: {
    setDisplay(state, action) {
      state.service = action.payload.service
      state.coupon = action.payload.coupon
    },
  },
})

export const deductionDisplayActions = deductionDisplaySlice.actions

export default deductionDisplaySlice.reducer
