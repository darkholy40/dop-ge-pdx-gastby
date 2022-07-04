import { createStore as reduxCreateStore, combineReducers } from "redux"
import { persistStore, persistReducer } from "redux-persist"

import { mainReducer, mainPersistConfig } from "./reducers/main"
import { staticReducer, staticPersistConfig } from "./reducers/static"
import { timerReducer, timerPersistConfig } from "./reducers/timer"
import { positionsReducer, positionsPersistConfig } from "./reducers/positions"
import { peopleReducer, peoplePersistConfig } from "./reducers/people"

const rootReducer = combineReducers({
  mainReducer: persistReducer(mainPersistConfig, mainReducer),
  staticReducer: persistReducer(staticPersistConfig, staticReducer),
  timerReducer: persistReducer(timerPersistConfig, timerReducer),
  positionsReducer: persistReducer(positionsPersistConfig, positionsReducer),
  peopleReducer: persistReducer(peoplePersistConfig, peopleReducer),
})

const myStore = () => {
  let store = reduxCreateStore(rootReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}

export default myStore
