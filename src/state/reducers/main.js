import storage from "../storage"
import {
  blue as primaryColor,
  amber as secondaryColor,
} from "@mui/material/colors"

const initialState = {
  sessionTimer: {
    hr: `08`,
    min: `00`,
    sec: `00`,
  },
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
      division1: ``,
      division2: ``,
      division3: ``,
    },
    role: {
      _id: ``,
      name: ``,
      type: ``,
      description: ``,
    },
  },
  tutorialCount: 0,
  searchPositionFilter: {
    posName: ``,
    posType: ``,
    unit: null,
    currentPage: 0,
  },
  searchPersonFilter: {
    personName: ``,
    personSurname: ``,
    personId: ``,
    personSid: ``,
    personType: ``,
    posNumber: ``,
    unit: null,
    isResigned: false,
    currentPage: 0,
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

const mainReducer = (state = initialState, action) => {
  switch (action.type) {
    case `SET_SESSION_TIMER`:
      return {
        ...state,
        sessionTimer: action.sessionTimer,
      }

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

const mainPersistConfig = {
  key: `gepdx_main`,
  storage: storage,
  whitelist: [`sessionTimer`, `lang`, `token`, `userInfo`, `tutorialCount`],
}

export { mainReducer, mainPersistConfig }
