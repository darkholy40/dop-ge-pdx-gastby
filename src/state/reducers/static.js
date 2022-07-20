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
  decorations: [],
  roles: [],
  installationDate: {
    positionTypes: null,
    units: null,
    locations: null,
    educationLevels: null,
    educationNames: null,
    educationalInstitutions: null,
    countries: null,
    decorations: null,
    roles: null,
  },
  tags: {
    positionTypes: ``,
    units: ``,
    locations: ``,
    educationLevels: ``,
    educationNames: ``,
    educationalInstitutions: ``,
    countries: ``,
    decorations: ``,
    roles: ``,
  },
  shouldUpdateStatic: [],
  serverConfigs: [],
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

    case `SET_DECORATIONS`:
      return {
        ...state,
        decorations: action.decorations,
      }

    case `SET_ROLES`:
      return {
        ...state,
        roles: action.roles,
      }

    case `SET_INSTALLATION_DATE`:
      return {
        ...state,
        installationDate: {
          ...state.installationDate,
          [action.key]: new Date(),
        },
      }

    case `SET_TAGS`:
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.key]: action.data,
        },
      }

    case `SET_SHOULD_UPDATE_STATIC`:
      return {
        ...state,
        shouldUpdateStatic: action.shouldUpdateStatic,
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
        decorations: [],
        roles: [],
        installationDate: {
          ...initialState.installationDate,
        },
        tags: {
          ...initialState.tags,
        },
      }

    case `SET_SERVER_CONFIG`:
      return {
        ...state,
        serverConfigs: action.serverConfigs,
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
    `decorations`,
    `roles`,
    `installationDate`,
    `tags`,
  ],
}

export { staticReducer, staticPersistConfig }
