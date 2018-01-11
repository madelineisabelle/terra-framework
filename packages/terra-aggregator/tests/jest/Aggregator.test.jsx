import React from 'react';

import Aggregator from '../../src/Aggregator';

describe('Aggregator', () => {
  it('should render a Aggregator without optional props', () => {
    const result = shallow((
      <Aggregator />
    ));
    expect(result).toMatchSnapshot();
  });
});
