import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';
import NewModalManager from 'terra-aggregator/lib/NewModalManager';

import PanelSection from './PanelSection';
import { disclosureKey as modalAggregatorDisclosureKey } from './ModalAggregator';

const propTypes = {
  size: PropTypes.string,
};

const sections = Object.freeze([
  <PanelSection key="1" name="Section 0" aggregatorKey="Section 0" />,
  <PanelSection key="2" name="Section 1" aggregatorKey="Section 1" />,
  <PanelSection key="3" name="Section 2" aggregatorKey="Section 2" />,
]);

const ModalButton = ({ app }) => (
  <button
    onClick={() => {
      app.disclose({
        preferredType: 'modal',
        size: 'large',
        content: {
          key: 'MODAL_EXAMPLE',
          name: modalAggregatorDisclosureKey,
          props: {
            identifier: 'MODAL_EXAMPLE',
          },
        },
      });
    }}
  >
    Launch Modal
  </button>
);

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
        <h3>Aggregator inside modal disclosure</h3>
        <NewModalManager>
          <ModalButton />
        </NewModalManager>
      </div>
    );

    return body;
  }
}

SimpleAggregatorExample.propTypes = propTypes;

export default SimpleAggregatorExample;
