import React from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import configureStore from "./src/state/store"
import Container from "./src/components/container"
import "./src/styles/layout.css"

// eslint-disable-next-line react/display-name, react/prop-types
const RootElement = ({ element }) => {
  // Instantiating store in `wrapRootElementElement` handler ensures:
  // - there is fresh store for each SSR page
  // - it will be called only once in browser, when React mounts
  const { store, persistor } = configureStore()
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Container>{element}</Container>
      </PersistGate>
    </Provider>
  )
}

export default RootElement
