import React from 'react';
import PropTypes from 'prop-types';
import NewModalManager from 'terra-aggregator/lib/NewModalManager';

import { disclosureKey as modalAggregatorDisclosureKey } from './components/ModalAggregator';

const propTypes = {
  size: PropTypes.string,
};

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
