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
  installationDate: {
    positionTypes: null,
    units: null,
    locations: null,
    educationLevels: null,
    educationNames: null,
    educationalInstitutions: null,
    countries: null,
  },
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

    case `SET_INSTALLATION_DATE`:
      return {
        ...state,
        installationDate: {
          ...state.installationDate,
          [action.key]: new Date(),
        },
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
        installationDate: {
          ...initialState.installationDate,
        },
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
    `installationDate`,
  ],
}

export { staticReducer, staticPersistConfig }
