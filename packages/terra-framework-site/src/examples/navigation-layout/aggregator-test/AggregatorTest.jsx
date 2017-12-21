import React from 'react';

import Aggregator from './Aggregator';
import Section from './Section';

const AggregatorTest = () => (
  <Aggregator>
    <Section name="Section 1" key="1" />
    <Section name="Section 2" key="2" />
    <Section name="Section 3" clearFocusOnRepeatSelect key="3" />
  </Aggregator>
);

export default AggregatorTest;
