import React from 'react';
import PropTypes from 'prop-types';
import AppDelegate from 'terra-app-delegate';
import ContentContainer from 'terra-content-container';
import ActionHeader from 'terra-clinical-action-header';

import AggregatorContainer from './AggregatorContainer';
import DisclosureSection from './DisclosureSection';

class ModalAggregator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const sections = [
      <DisclosureSection key="1" name="1" aggregatorKey="1" />,
      <DisclosureSection key="2" name="2" aggregatorKey="2" />,
      <DisclosureSection key="3" name="3" aggregatorKey="3" />,
    ];

    const body = (
      <ContentContainer
        fill
        header={<ActionHeader onClose={this.props.app.closeDisclosure} onBack={this.props.app.goBack} />}
      >
        <AggregatorContainer app={this.props.app}>
          { this.state.flip ? sections.reverse() : sections}
        </AggregatorContainer>
      </ContentContainer>
    );

    return body;
  }
}

export default ModalAggregator;

const disclosureKey = 'ModalAggregator';
AppDelegate.registerComponentForDisclosure(disclosureKey, ModalAggregator);
export { disclosureKey };
