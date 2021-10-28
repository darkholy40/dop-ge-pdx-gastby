import { createStore as reduxCreateStore } from "redux"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import {
  green as primaryColor,
  amber as secondaryColor,
} from "@mui/material/colors"

const initialState = {
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
      Organize: ``,
      OrganizeType: ``,
      ministry: ``,
      DivisionName: ``,
      published_at: ``,
      createdAt: ``,
      updatedAt: ``,
    },
    role: {
      _id: ``,
      name: ``,
      type: ``,
    },
  },
  searchFilter: {
    posName: ``,
    posType: ``,
    posNumber: ``,
  },
  addPositionFilter: {
    posName: ``,
    posType: ``,
    posNumber: ``,
    posOpen: false,
    posSouth: false,
  },
  notificationDialog: {
    open: false,
    title: ``,
    description: ``,
    variant: ``,
    confirmText: ``,
    callback: () => {},
  },
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

    case `SET_SEARCH_FILTER`:
      return {
        ...state,
        searchFilter: action.searchFilter,
      }

    case `SET_ADD_POSITION_FILTER`:
      return {
        ...state,
        addPositionFilter: action.addPositionFilter,
      }

    case `SET_NOTIFICATION_DIALOG`:
      return {
        ...state,
        notificationDialog: action.notificationDialog,
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
