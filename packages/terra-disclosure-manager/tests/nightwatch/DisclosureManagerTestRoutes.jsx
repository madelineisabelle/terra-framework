/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Route } from 'react-router';
import DisclosureManagerTests from './DisclosureManagerTests';

// Test Cases
import DefaultDisclosureManager from './DefaultDisclosureManager';

const routes = (
  <div>
    <Route path="/tests/disclosure-manager-tests" component={DisclosureManagerTests} />
    <Route path="/tests/disclosure-manager-tests/default" component={DefaultDisclosureManager} />
  </div>
);

export default routes;
