import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';

const propTypes = {
  size: PropTypes.string,
};

const AggregatorExample = () => (
  <Aggregator />
);

AggregatorExample.propTypes = propTypes;

export default AggregatorExample;
