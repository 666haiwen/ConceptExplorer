import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import reducer from './reducers';
import { rootSaga } from './actions/sagas';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
    reducer, composeWithDevTools(
      applyMiddleware(sagaMiddleware)
      // other store enhancers if any
));
export default store;

sagaMiddleware.run(rootSaga);

