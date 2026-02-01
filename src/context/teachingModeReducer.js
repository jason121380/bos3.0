import { TEACHING_MODE } from './types'

export default (state, action) => {
  switch (action.type) {
    case TEACHING_MODE:
      return {
        ...state,
        teachingMode: !state.teachingMode,
      }
    default:
      return state
  }
}
