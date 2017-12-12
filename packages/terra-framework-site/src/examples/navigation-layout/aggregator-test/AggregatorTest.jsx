import React from 'react';

import Aggregator from './Aggregator';
import Section from './Section';

const AggregatorTest = () => (
  <Aggregator>
    <Section name="Section 1" />
    <Section name="Section 2" />
    <Section name="Section 3" maintainSelectionOnClose />
  </Aggregator>
);

export default AggregatorTest;
