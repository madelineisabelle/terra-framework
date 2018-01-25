import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';
import NewModalManager from 'terra-aggregator/lib/NewModalManager';

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

  // render={children => (
  //   <div style={{ height: '100%', padding: '15px' }}>
  //     {children.map((child, index) => React.cloneElement(child, { style: { marginTop: index !== 0 ? '15px' : '0px', border: '1px solid lightgrey' } }))}
  //   </div>
  //   )}

  render() {
    const body = (
      <div>
        <h3>Aggregator within ModalManager</h3>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        {
          <NewModalManager>
            <Aggregator>
              {this.state.flip ? Object.assign([], sections).reverse() : sections }
            </Aggregator>
          </NewModalManager>
        }
      </div>
    );

    return body;
  }
}

ModalAggregtorExample.propTypes = propTypes;

export default ModalAggregtorExample;
