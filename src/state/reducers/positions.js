import storage from "../storage"

const initialState = {
  searchPositionFilter: {
    posName: ``,
    posType: ``,
    unit: null,
    currentPage: 0,
  },
}

const positionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case `SET_SEARCH_POSITION_FILTER`:
      return {
        ...state,
        searchPositionFilter: action.searchPositionFilter,
      }

    default:
      break
  }

  return state
}

const positionsPersistConfig = {
  key: `gepdx_positions`,
  storage: storage,
  whitelist: [],
}

export { positionsReducer, positionsPersistConfig }
