import storage from "../storage"

const initialState = {
  sessionTimer: {
    hr: `24`,
    min: `00`,
    sec: `00`,
  },
}

const timerReducer = (state = initialState, action) => {
  switch (action.type) {
    case `SET_SESSION_TIMER`:
      return {
        ...state,
        sessionTimer: action.sessionTimer,
      }

    case ``:
      return {
        ...state,
        sessionTimer: initialState.sessionTimer,
      }

    default:
      break
  }

  return state
}

const timerPersistConfig = {
  key: `gepdx_timer`,
  storage: storage,
  whitelist: [`sessionTimer`],
}

export { timerReducer, timerPersistConfig }
