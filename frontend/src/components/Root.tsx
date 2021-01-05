import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, BrowserRouter } from 'react-router-dom';
import {AppPane} from './App';

const Root = ({store}: any): JSX.Element => (
  <Provider store={store}>
    <BrowserRouter>
      <Route path='/' component={AppPane} />
    </BrowserRouter>
  </Provider>
);

const exportRoot = process.env.NODE_ENV === 'production' ? Root : hot(Root);
export default exportRoot;
