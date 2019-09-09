import 'react-hot-loader'
import * as React from 'react'
import { Store } from 'webext-redux'
import ReactDOM from 'react-dom'
import { Store as ReduxStore } from 'redux'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from '../background/store'
import OptionsApp from './containers/OptionsApp'
import DevStore from '../dev/store'

const buildApp = (store: ReduxStore | Store) => {
  ReactDOM.render(
    <Provider store={store as any}>
      <PersistGate loading={null} persistor={persistor}>
        <OptionsApp />
      </PersistGate>
    </Provider>,
    document.getElementById('options-root')
  )
}

if ((module as any).hot) {
  const store = DevStore
  buildApp(store)
} else {
  const store = new Store({
    portName: 'ExPort' // Communication port between the background component and views such as browser tabs.
  })
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  store.ready().then(() => buildApp(store))
}