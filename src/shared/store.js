import {
    compose,
    createStore,
    combineReducers,
    applyMiddleware,
} from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import appEnhancers from '__app_modules__redux_enhancers__';
import { storeEnhancers as devEnhancers } from './devTools';

export function createRootReducer(reducers) {
    return combineReducers({ ...reducers, routing: routerReducer });
}

export function create(history, reducers, middlewares, initialState) {
    const createStoreWithMiddleware = compose(
        applyMiddleware(...middlewares, thunk, routerMiddleware(history)),
        ...devEnhancers,
        ...appEnhancers,
    )(createStore);

    const rootReducer = createRootReducer(reducers);
    const store = createStoreWithMiddleware(rootReducer, initialState);

    return store;
}
