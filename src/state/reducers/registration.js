import storage from "../storage"

const initialState = {
  serverStates: {
    isOnline: true,
    isOpenToRegistration: false,
    notice: ``,
    isFetched: false,
  },
}

const registrationReducer = (state = initialState, action) => {
  switch (action.type) {
    case `SET_SERVER_STATES`:
      return {
        ...state,
        serverStates: action.serverStates,
      }

    default:
      break
  }

  return state
}

const registrationPersistConfig = {
  key: `gepdx_registration`,
  storage: storage,
  whitelist: [],
}

export { registrationReducer, registrationPersistConfig }
