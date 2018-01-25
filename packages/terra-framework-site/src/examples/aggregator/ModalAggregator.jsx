import React from 'react';
import PropTypes from 'prop-types';
import AppDelegate from 'terra-app-delegate';
import ContentContainer from 'terra-content-container';
import ActionHeader from 'terra-clinical-action-header';
import Aggregator from 'terra-aggregator';

import PanelSection from './PanelSection';

class ModalAggregator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const sections = [
      <PanelSection key="1" name="1" aggregatorKey="1" />,
      <PanelSection key="2" name="2" aggregatorKey="2" />,
      <PanelSection key="3" name="3" aggregatorKey="3" />,
    ];

    const body = (
      <ContentContainer
        fill
        header={<ActionHeader onClose={this.props.app.closeDisclosure} onBack={this.props.app.goBack} />}
      >
        <div style={{ height: '100%', padding: '10px' }}>
          <Aggregator key="modalAggregator" app={this.props.app}>
            { this.state.flip ? sections.reverse() : sections}
          </Aggregator>
        </div>
      </ContentContainer>
    );

    return body;
  }
}

export default ModalAggregator;

const disclosureKey = 'ModalAggregator';
AppDelegate.registerComponentForDisclosure(disclosureKey, ModalAggregator);
export { disclosureKey };
