import { createStore as reduxCreateStore } from "redux"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import {
  green as primaryColor,
  amber as secondaryColor,
} from "@mui/material/colors"

const initialState = {
  positionTypes: [],
  positionNames: [],
  units: [],
  primaryColor: primaryColor,
  secondaryColor: secondaryColor,
  lang: `th`,
  url: process.env.GEPDX_API_URL,
  backdropOpen: false,
  currentPage: `home`,
  token: ``,
  userInfo: {
    _id: ``,
    confirmed: false,
    blocked: false,
    name: ``,
    username: ``,
    surname: ``,
    email: ``,
    createdAt: ``,
    updatedAt: ``,
    division: {
      _id: ``,
    },
    role: {
      _id: ``,
      name: ``,
      type: ``,
    },
  },
  searchPositionFilter: {
    posName: ``,
    posType: ``,
    unit: null,
  },
  searchPersonFilter: {
    personName: ``,
    personSurname: ``,
    personId: ``,
    personSid: ``,
    posNumber: ``,
    unit: null,
  },
  notificationDialog: {
    open: false,
    title: ``,
    description: ``,
    variant: ``,
    confirmText: ``,
    callback: () => {},
  },
  redirectPage: ``,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case `CHANGE_LANG`:
      return {
        ...state,
        lang: action.lang,
      }

    case `SET_BACKDROP_OPEN`:
      return {
        ...state,
        backdropOpen: action.backdropOpen,
      }

    case `SET_CURRENT_PAGE`:
      return {
        ...state,
        currentPage: action.currentPage,
      }

    case `SET_TOKEN`:
      return {
        ...state,
        token: action.token,
      }

    case `SET_USER_INFO`:
      return {
        ...state,
        userInfo: action.userInfo,
      }

    case `SET_SEARCH_POSITION_FILTER`:
      return {
        ...state,
        searchPositionFilter: action.searchPositionFilter,
      }

    case `SET_SEARCH_PERSON_FILTER`:
      return {
        ...state,
        searchPersonFilter: action.searchPersonFilter,
      }

    case `SET_NOTIFICATION_DIALOG`:
      return {
        ...state,
        notificationDialog: action.notificationDialog,
      }

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

    case `SET_REDIRECT_PAGE`:
      return {
        ...state,
        redirectPage: action.redirectPage,
      }

    default:
      break
  }

  return state
}

const persistConfig = {
  key: `gepdx`,
  storage: storage,
  whitelist: [`lang`, `token`, `userInfo`],
}

const persistedReducer = persistReducer(persistConfig, reducer)
const ano = () => {
  let store = reduxCreateStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}

export default ano
