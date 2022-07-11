import storage from "../storage"

const initialState = {
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
}

const peopleReducer = (state = initialState, action) => {
  switch (action.type) {
    case `SET_SEARCH_PERSON_FILTER`:
      return {
        ...state,
        searchPersonFilter: action.searchPersonFilter,
      }

    default:
      break
  }

  return state
}

const peoplePersistConfig = {
  key: `gepdx_people`,
  storage: storage,
  whitelist: [],
}

export { peopleReducer, peoplePersistConfig }
