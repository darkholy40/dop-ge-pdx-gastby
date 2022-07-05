import storage from "../storage"
import {
  blue as primaryColor,
  amber as secondaryColor,
} from "@mui/material/colors"

const initialState = {
  primaryColor: primaryColor,
  secondaryColor: secondaryColor,
  lang: `th`,
  backdropDialog: {
    open: false,
    title: ``,
  },
  currentPage: `home`,
  token: ``,
  userInfo: {
    _id: ``,
    rank: ``,
    name: ``,
    surname: ``,
    userPosition: ``,
    username: ``,
    email: ``,
    confirmed: false,
    blocked: false,
    createdAt: ``,
    updatedAt: ``,
    division: null,
    role: null,
  },
  tutorialCount: 0,
  notificationDialog: {
    open: false,
    title: ``,
    description: ``,
    variant: ``,
    confirmText: ``,
    callback: () => {},
  },
}

const mainReducer = (state = initialState, action) => {
  switch (action.type) {
    case `CHANGE_LANG`:
      return {
        ...state,
        lang: action.lang,
      }

    case `SET_BACKDROP_OPEN`:
      return {
        ...state,
        backdropDialog: action.backdropDialog,
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

    case `SET_TUTORIAL_COUNT`:
      return {
        ...state,
        tutorialCount: action.tutorialCount,
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

const mainPersistConfig = {
  key: `gepdx_main`,
  storage: storage,
  whitelist: [`lang`, `token`, `userInfo`, `tutorialCount`],
}

export { mainReducer, mainPersistConfig }
