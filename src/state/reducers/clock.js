import storage from "../storage"

const multipliers = 7
const getUniversalCoordinatedTime = () => {
  const dateString = new Date()
  dateString.setTime(dateString.valueOf() + multipliers * 60 * 60 * 1000)

  return {
    day: dateString.getUTCDay(), // 0 - 7 ---> Sun - Sat
    date: dateString.getUTCDate(),
    month: dateString.getUTCMonth(), // 0 - 11 --> Jan - Dec
    year: dateString.getUTCFullYear(),
    hour: dateString.getUTCHours(),
    minute: dateString.getUTCMinutes(),
    second: dateString.getUTCSeconds(),
  }
}

const initialState = {
  utcMultipliers: multipliers,
  newDate: getUniversalCoordinatedTime(),
  timeFormat: {
    twentyFourHourTime: false,
    longDate: false,
  },
}

const clockReducer = (state = initialState, action) => {
  switch (action.type) {
    case `FETCH_CLOCK`:
      return {
        ...state,
        newDate: getUniversalCoordinatedTime(),
      }

    case `SET_TIME_FORMAT`:
      return {
        ...state,
        timeFormat: action.timeFormat,
      }

    default:
      break
  }

  return state
}

const clockPersistConfig = {
  key: `gepdx_clock`,
  storage: storage,
  whitelist: [`utcMultipliers`, `timeFormat`],
}

export { clockReducer, clockPersistConfig }
