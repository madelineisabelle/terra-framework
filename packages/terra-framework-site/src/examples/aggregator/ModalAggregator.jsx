import React from 'react';
import PropTypes from 'prop-types';
import AppDelegate from 'terra-app-delegate';
import ContentContainer from 'terra-content-container';
import ActionHeader from 'terra-clinical-action-header';
// import Aggregator, { reducers as aggregatorReducers } from 'terra-aggregator';

import { instanceGenerator } from 'terra-aggregator';

import Section from './ExampleSection';

const { Aggregator, reducer } = instanceGenerator('ModalAggregator');

class ModalAggregator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const sections = [
      <Section key="1" name="1" sectionKey="1" />,
      <Section key="2" name="2" sectionKey="2" />,
      <Section key="3" name="3" sectionKey="3" />,
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

export { reducer as reducers };
