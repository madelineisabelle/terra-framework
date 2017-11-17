/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PropsTable from 'terra-props-table';
import Markdown from 'terra-markdown';
import ReadMe from 'terra-application-menu/docs/README.md';
import { version } from 'terra-application-menu/package.json';

// Component Source
/* eslint-disable import/no-webpack-loader-syntax, import/first, import/no-unresolved, import/extensions */
import MenuSrc from '!raw-loader!terra-application-menu/src/ApplicationMenu.jsx';
/* eslint-enable import/no-webpack-loader-syntax, import/first, import/no-unresolved, import/extensions */

// Example Files
import MenuStandard from './MenuStandard';
import MenuWireframe from './MenuWireframe';

const NavigationExamples = () => (
  <div>
    <div id="version">Version: {version}</div>
    <Markdown id="readme" src={ReadMe} />
    <PropsTable id="props-menu" src={MenuSrc} componentName="Application Menu" />
    <h2 id="menu-wireframe">Menu Wireframe</h2>
    <MenuWireframe />
    <h2 id="menu-standard">Menu Standard</h2>
    <MenuStandard />
  </div>
);

export default NavigationExamples;