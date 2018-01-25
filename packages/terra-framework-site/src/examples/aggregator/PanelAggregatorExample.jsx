import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';
// import NewModalManager from 'terra-aggregator/lib/NewModalManager';
import SlidePanelManager from 'terra-aggregator/lib/SlidePanelManager';

import PanelSection from './PanelSection';

const propTypes = {
  size: PropTypes.string,
};

const sections = Object.freeze([
  <PanelSection key="1" name="Section 0" aggregatorKey="Section 0" />,
  <PanelSection key="2" name="Section 1" aggregatorKey="Section 1" />,
  <PanelSection key="3" name="Section 2" aggregatorKey="Section 2" />,
]);

class SimpleAggregatorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  // render={children => (
  //   <div style={{ height: '100%', padding: '15px' }}>
  //     {children.map((child, index) => React.cloneElement(child, { style: { marginTop: index !== 0 ? '15px' : '0px', border: '1px solid lightgrey' } }))}
  //   </div>
  //   )}

  render() {
    const body = (
      <div>
        <h3>Aggregator within SlidePanelManager</h3>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        {
          <SlidePanelManager>
            <Aggregator>
              {this.state.flip ? Object.assign([], sections).reverse() : sections }
            </Aggregator>
          </SlidePanelManager>
        }
      </div>
    );

    return body;
  }
}

SimpleAggregatorExample.propTypes = propTypes;

export default SimpleAggregatorExample;
