import storage from "../storage"

const initialState = {
  positionTypes: [],
  positionNames: [],
  units: [],
  locations: [],
  educationLevels: [],
  educationNames: [],
  educationalInstitutions: [],
  countries: [],
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

    case `SET_EDUCATION_LEVELS`:
      return {
        ...state,
        educationLevels: action.educationLevels,
      }

    case `SET_EDUCATION_NAMES`:
      return {
        ...state,
        educationNames: action.educationNames,
      }

    case `SET_EDUCATIONAL_INSTITUTIONS`:
      return {
        ...state,
        educationalInstitutions: action.educationalInstitutions,
      }

    case `SET_COUNTRIES`:
      return {
        ...state,
        countries: action.countries,
      }

    case `SET_ZERO`:
      return {
        ...state,
        positionTypes: [],
        positionNames: [],
        units: [],
        locations: [],
        educationLevels: [],
        educationNames: [],
        educationalInstitutions: [],
        countries: [],
      }

    default:
      break
  }

  return state
}

const staticPersistConfig = {
  key: `gepdx_static`,
  storage: storage,
  whitelist: [
    `positionTypes`,
    `positionNames`,
    `units`,
    `locations`,
    `educationLevels`,
    `educationNames`,
    `educationalInstitutions`,
    `countries`,
  ],
}

export { staticReducer, staticPersistConfig }
