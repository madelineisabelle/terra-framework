import React from 'react';
import PropTypes from 'prop-types';
import NewModalManager from 'terra-aggregator/lib/NewModalManager';

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

class ModalAggregtorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const body = (
      <div>
        <h3>Aggregator within ModalManager</h3>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        <NewModalManager>
          <AggregatorContainer>
            {this.state.flip ? Object.assign([], sections).reverse() : sections }
          </AggregatorContainer>
        </NewModalManager>
      </div>
    );

    return body;
  }
}

ModalAggregtorExample.propTypes = propTypes;

export default ModalAggregtorExample;
