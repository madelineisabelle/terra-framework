import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';
import SlidePanelManager from 'terra-aggregator/lib/SlidePanelManager';

import AggregatorContainer from './AggregatorContainer';
import DisclosureSection from './DisclosureSection';

const propTypes = {
  size: PropTypes.string,
};

const sections = Object.freeze([
  <DisclosureSection key="1" name="Section 0" aggregatorKey="Section 0" />,
  <DisclosureSection key="2" name="Section 1" aggregatorKey="Section 1" />,
  <DisclosureSection key="3" name="Section 2" aggregatorKey="Section 2" />,
]);

class SimpleAggregatorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const body = (
      <div>
        <h3>Aggregator within SlidePanelManager</h3>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        <SlidePanelManager>
          <AggregatorContainer>
            {this.state.flip ? Object.assign([], sections).reverse() : sections }
          </AggregatorContainer>
        </SlidePanelManager>
      </div>
    );

    return body;
  }
}

SimpleAggregatorExample.propTypes = propTypes;

export default SimpleAggregatorExample;
