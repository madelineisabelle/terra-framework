import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';

import AggregatorItem from './components/AggregatorItem';

const propTypes = {
  size: PropTypes.string,
};

const items = Object.freeze([{
  key: 'SECTION_0',
  component: <AggregatorItem key="0" name="Section 0" />,
}, {
  key: 'SECTION_1',
  component: <AggregatorItem key="1" name="Section 1" />,
}, {
  key: 'SECTION_2',
  component: <AggregatorItem key="2" name="Section 2" />,
}, {
  key: 'SECTION_3',
  component: <AggregatorItem key="3" name="Section 3" />,
}]);

class StandaloneAggregatorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const body = (
      <div>
        <h3>Aggregator without disclosure</h3>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        <Aggregator
          items={this.state.flip ? Object.assign([], items).reverse() : items}
        />
      </div>
    );

    return body;
  }
}

StandaloneAggregatorExample.propTypes = propTypes;

export default StandaloneAggregatorExample;
