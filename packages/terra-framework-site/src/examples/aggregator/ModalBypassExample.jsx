import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';

import NewModalManager from 'terra-aggregator/lib/NewModalManager';
import SlidePanelManager from 'terra-aggregator/lib/SlidePanelManager';
import DisclosureSection from './DisclosureSection';

const propTypes = {
  size: PropTypes.string,
};

const sections = Object.freeze([
  <DisclosureSection key="1" name="Section 0" aggregatorKey="Section 0" disclosureType="panel" />,
  <DisclosureSection key="2" name="Section 1" aggregatorKey="Section 1" disclosureType="panel" />,
  <DisclosureSection key="3" name="Section 2" aggregatorKey="Section 2" disclosureType="panel" />,
]);

const ModalManagerBypass = ({ app, flip }) => {
  const updatedSections = sections.map(section => (
    React.cloneElement(section, { app })
  ));

  return (
    <SlidePanelManager app={app}>
      <Aggregator>
        {flip ? Object.assign([], updatedSections).reverse() : updatedSections }
      </Aggregator>
    </SlidePanelManager>
  );
};

class ModalBypassExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const body = (
      <div>
        <h3>Aggregator with ModalManager jumper</h3>
        <h4>Launching the modal from the header should not impact Aggregator state</h4>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        {
          <NewModalManager>
            <ModalManagerBypass flip={this.state.flip} />
          </NewModalManager>
        }
      </div>
    );

    return body;
  }
}

ModalBypassExample.propTypes = propTypes;

export default ModalBypassExample;
