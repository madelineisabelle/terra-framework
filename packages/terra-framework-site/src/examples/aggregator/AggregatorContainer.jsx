import React from 'react';
import PropTypes from 'prop-types';
import AppDelegate from 'terra-app-delegate';
import Aggregator from 'terra-aggregator';

const propTypes = {
  app: AppDelegate.propType,
  children: PropTypes.node,
};

class AggregatorContainer extends React.Component {
  render() {
    const { app, children } = this.props;

    const updatedItems = React.Children.map(children, item => (
      React.cloneElement(item, {
        registerDismissCheck: app.registerLock,
        requestDisclosureFocus: app.requestFocus,
        releaseDisclosureFocus: app.releaseFocus,
      })
    ));

    return (
      <Aggregator
        disclose={app.disclose}
      >
        {updatedItems}
      </Aggregator>
    );
  }
}

AggregatorContainer.propTypes = propTypes;

export default AggregatorContainer;
