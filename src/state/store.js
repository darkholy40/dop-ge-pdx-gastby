import { createStore as reduxCreateStore, combineReducers } from "redux"
import { persistStore, persistReducer } from "redux-persist"

import { mainReducer, mainPersistConfig } from "./reducers/main"
import { staticReducer, staticPersistConfig } from "./reducers/static"

const rootReducer = combineReducers({
  mainReducer: persistReducer(mainPersistConfig, mainReducer),
  staticReducer: persistReducer(staticPersistConfig, staticReducer),
})

const myStore = () => {
  let store = reduxCreateStore(rootReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}

export default myStore
