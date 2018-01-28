/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PropsTable from 'terra-props-table';
import Markdown from 'terra-markdown';
import ReadMe from 'terra-disclosure-manager/docs/README.md';
import { version } from 'terra-disclosure-manager/package.json';

// Component Source
// eslint-disable-next-line import/no-webpack-loader-syntax, import/first, import/no-unresolved, import/extensions
import DisclosureManagerSrc from '!raw-loader!terra-disclosure-manager/src/DisclosureManager';

// Example Files

const DisclosureManagerExamples = () => (
  <div>
    <div id="version">Version: {version}</div>
    <Markdown id="readme" src={ReadMe} />
    <PropsTable id="props" src={DisclosureManagerSrc} />
  </div>
);

export default DisclosureManagerExamples;
