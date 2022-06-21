import storage from "../storage"

const initialState = {
  positionTypes: [],
  positionNames: [],
  units: [],
  locations: [],
}

const staticReducer = (state = initialState, action) => {
  switch (action.type) {
    case `SET_POSITION_TYPES`:
      return {
        ...state,
        positionTypes: action.positionTypes,
      }

    case `SET_POSITION_NAMES`:
      return {
        ...state,
        positionNames: action.positionNames,
      }

    case `SET_UNITS`:
      return {
        ...state,
        units: action.units,
      }

    case `SET_LOCATIONS`:
      return {
        ...state,
        locations: action.locations,
      }

    default:
      break
  }

  return state
}

const staticPersistConfig = {
  key: `gepdx_static`,
  storage: storage,
  whitelist: [`positionTypes`, `positionNames`, `units`, `locations`],
}

export { staticReducer, staticPersistConfig }
