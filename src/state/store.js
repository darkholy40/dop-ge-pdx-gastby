import { createStore as reduxCreateStore } from "redux"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"

const initialState = {
  lang: "th",
  url: process.env.GEPDX_API_URL,
  currentPage: "home",
  token: "",
  userInfo: {
    _id: "",
    confirmed: false,
    blocked: false,
    name: "",
    username: "",
    surname: "",
    email: "",
    createdAt: "",
    updatedAt: "",
    division: {
      _id: "",
      Organize: "",
      OrganizeType: "",
      ministry: "",
      DivisionName: "",
      published_at: "",
      createdAt: "",
      updatedAt: "",
    },
    role: {
      _id: "",
      name: "",
      type: "",
    },
  },
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHANGE_LANG":
      return {
        ...state,
        lang: action.lang,
      }

    case "SET_CURRENT_PAGE":
      return {
        ...state,
        currentPage: action.currentPage,
      }

    case "SET_TOKEN":
      return {
        ...state,
        token: action.token,
      }

    case "SET_USER_INFO":
      return {
        ...state,
        userInfo: action.userInfo,
      }

    default:
      break
  }

  return state
}

const persistConfig = {
  key: "gepdx",
  storage: storage,
  whitelist: ["lang", "token", "userInfo"],
}

const persistedReducer = persistReducer(persistConfig, reducer)
const ano = () => {
  let store = reduxCreateStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}

export default ano
