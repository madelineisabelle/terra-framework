/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PropsTable from 'terra-props-table';
import Markdown from 'terra-markdown';
import ReadMe from 'terra-aggregator/docs/README.md';
import { version } from 'terra-aggregator/package.json';

// Component Source
/* eslint-disable import/no-webpack-loader-syntax, import/first, import/no-unresolved, import/extensions */
import AggregatorSrc from '!raw-loader!terra-aggregator/src/Aggregator.jsx';
/* eslint-enable import/no-webpack-loader-syntax, import/first, import/no-unresolved, import/extensions */

// Example Files
import AggregatorExample from './AggregatorExample';

const NavigationExamples = () => (
  <div>
    <div id="version">Version: {version}</div>
    <Markdown id="readme" src={ReadMe} />
    <PropsTable id="props-header" src={AggregatorSrc} componentName="Aggregator" />
    <h2 id="aggregator-example">Example</h2>
    <AggregatorExample />
  </div>
);

export default NavigationExamples;
