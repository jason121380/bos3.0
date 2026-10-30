import React, { useReducer } from 'react'

import TeachingContext from './teachingModeContext'
import TeachingModeReducer from './teachingModeReducer'
import { TEACHING_MODE } from './types'

const TeachingModeState = props => {
  const initialState = {
    teachingMode: JSON.parse(localStorage.getItem('teachingMode')) === null ? true : JSON.parse(localStorage.getItem('teachingMode')),
  }

  const [state, dispatch] = useReducer(TeachingModeReducer, initialState)

  const setTeachingMode = () => {
    dispatch({ type: TEACHING_MODE })
    if (!state.teachingMode) {
      localStorage.setItem('teachingMode', true)
    } else {
      localStorage.setItem('teachingMode', false)
    }
  }

  return (
    <TeachingContext.Provider
      value={{
        // teachingMode: state.teachingMode,
        teachingMode: false,
        setTeachingMode,
      }}
    >
      {props.children}
    </TeachingContext.Provider>
  )
}

export default TeachingModeState
