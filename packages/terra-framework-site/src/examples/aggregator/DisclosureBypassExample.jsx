import React from 'react';
import PropTypes from 'prop-types';

import NewModalManager from './tmp/NewModalManager';
import SlidePanelManager from './tmp/SlidePanelManager';

import AggregatorContainer from './components/AggregatorContainer';
import AggregatorItem from './components/AggregatorItem';

const propTypes = {
  size: PropTypes.string,
};

const items = Object.freeze([{
  key: 'SECTION_0',
  component: <AggregatorItem key="0" name="Section 0" disclosureType="panel" />,
}, {
  key: 'SECTION_1',
  component: <AggregatorItem key="1" name="Section 1" disclosureType="panel" />,
}]);

const ModalManagerBypass = ({ app }) => {
  const updatedItems = items.map(item => (
    {
      key: item.key,
      component: React.cloneElement(item.component, {
        disclose: app.disclose,
      }),
    }
  ));

  return (
    <SlidePanelManager app={app}>
      <AggregatorContainer
        items={updatedItems}
      />
    </SlidePanelManager>
  );
};

const ModalBypassExample = () => (
  <div>
    <h3>Aggregator with ModalManager jumper</h3>
    <h4>Launching the modal from the header should not impact Aggregator state</h4>
    <NewModalManager>
      <ModalManagerBypass />
    </NewModalManager>
  </div>
);

ModalBypassExample.propTypes = propTypes;

export default ModalBypassExample;
