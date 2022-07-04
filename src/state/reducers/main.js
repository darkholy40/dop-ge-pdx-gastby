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
    confirmed: false,
    blocked: false,
    name: ``,
    username: ``,
    surname: ``,
    email: ``,
    createdAt: ``,
    updatedAt: ``,
    division: null,
    role: null,
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
  addPersonFilter: {
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

    case `SET_ADD_PERSON_FILTER`:
      return {
        ...state,
        addPersonFilter: action.addPersonFilter,
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
  whitelist: [`lang`, `token`, `userInfo`, `tutorialCount`],
}

export { mainReducer, mainPersistConfig }
