import React from 'react';
import PropTypes from 'prop-types';
import NewModalManager from 'terra-aggregator/lib/NewModalManager';
import SlidePanelManager from 'terra-aggregator/lib/SlidePanelManager';

import AggregatorContainer from './AggregatorContainer';
import DisclosureSection from './DisclosureSection';
import FocusSection from './FocusSection';

const propTypes = {
  size: PropTypes.string,
};

const sections = Object.freeze([
  <DisclosureSection key="1" name="Slide Panel Section" aggregatorKey="Slide Panel Section" disclosureType="panel" />,
  <DisclosureSection key="2" name="Modal Section" aggregatorKey="Modal Section" disclosureType="modal" />,
  <FocusSection key="3" name="No Disclosure Section" aggregatorKey="No Disclosure Section" />,
]);

class CombinedDisclosureExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const body = (
      <div>
        <h3>Aggregator with multiple parent managers</h3>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        {
          <NewModalManager>
            <SlidePanelManager>
              <AggregatorContainer>
                {this.state.flip ? Object.assign([], sections).reverse() : sections }
              </AggregatorContainer>
            </SlidePanelManager>
          </NewModalManager>
        }
      </div>
    );

    return body;
  }
}

CombinedDisclosureExample.propTypes = propTypes;

export default CombinedDisclosureExample;
